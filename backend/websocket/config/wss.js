const WebSocket = require('ws');
const axios = require('axios');
const { verifyToken } = require('../auth');
const messageService = require('../services/messageService');
const typingService = require('../services/typingService');
require('dotenv').config(); // Charger les variables d'environnement

let server;
const activeRooms = new Map();
const pendingNotifications = new Map();

// Configuration du serveur HTTP/HTTPS en fonction de PROD
if (process.env.PROD === 'true') {
  const https = require('https');
  const fs = require('fs');

  // Charger les certificats SSL pour wss (à adapter avec vos chemins)
  server = https.createServer({
    key: fs.readFileSync('path/to/private.key'),
    cert: fs.readFileSync('path/to/certificate.crt')
  });
  console.log('Mode production : Utilisation de wss (WebSocket Secure)');
} else {
  const http = require('http');
  server = http.createServer();
  console.log('Mode développement : Utilisation de ws (WebSocket non sécurisé)');
}

// Initialiser le serveur WebSocket
const wss = new WebSocket.Server({ server });

// Middleware d'authentification et gestion des connexions
wss.on('connection', async (ws, req) => {
  try {
    const token = process.env.PROD === 'true'
      ? req.headers['sec-websocket-protocol']?.split('Bearer ')[1]
      : new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');
    if (!token) {
      ws.close(1008, 'Token manquant');
      return;
    }
    let user;
    try {
      user = await verifyToken(token);
    } catch (err) {
      console.error('Erreur de vérification du token:', err.message);
      ws.close(1008, 'Token invalide');
      return;
    }
    user.token = token;
    ws.user = user;
    // Interval to check if user is still authenticated
    ws._authInterval = setInterval(async () => {
      try {
        await verifyToken(token);
      } catch (err) {
        console.log(`Déconnexion forcée: token invalide pour l'utilisateur ${user.user_id}`);
        ws.close(4001, 'Session expirée ou utilisateur déconnecté');
        clearInterval(ws._authInterval);
      }
    }, 30000); // check every 30 seconds
    try {
      const { data } = await axios.get(`${process.env.API_URL}/conversations/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      data.forEach(conversation => {
        const convId = String(conversation.conversation_id);
        if (!activeRooms.has(convId)) {
          activeRooms.set(convId, new Map());
        }
        activeRooms.get(convId).set(user.user_id, ws);
        console.log(`Room créée/peuplée : ${convId}, utilisateurs :`, Array.from(activeRooms.get(convId).keys()));
      });
      // Envoyer les notifications en attente
      const notifications = pendingNotifications.get(user.user_id) || [];
      if (notifications.length > 0) {
        ws.send(JSON.stringify({ type: 'pendingNotifications', data: notifications }));
        pendingNotifications.delete(user.user_id);
      }
      // Gestion des messages et événements
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          switch (message.type) {
            case 'sendMessage':
              await messageService.handleMessage(ws, message.data, activeRooms, pendingNotifications);
              break;
            case 'userTyping':
              typingService.handleTyping(ws, message.data, activeRooms);
              break;
            case 'joinConversation':
              ws.conversationId = message.conversationId;
              break;
          }
        } catch (messageError) {
          console.error('Erreur lors du traitement du message:', messageError);
        }
      });
      ws.on('close', () => {
        activeRooms.forEach((users, convId) => {
          if (users.has(ws.user.user_id)) {
            users.delete(ws.user.user_id);
            console.log(`Utilisateur déconnecté de la room ${convId}: ${ws.user.user_id}`);
            if (users.size === 0) {
              activeRooms.delete(convId);
              console.log(`Room ${convId} supprimée car vide`);
            }
          }
        });
        console.log(`Utilisateur déconnecté: ${ws.user.user_id}`);
        if (ws._authInterval) clearInterval(ws._authInterval);
      });
    } catch (conversationError) {
      console.error('Erreur lors de la récupération des conversations:', conversationError);
      ws.close(1011, 'Erreur serveur');
    }
  } catch (connectionError) {
    console.error('Erreur inattendue lors de la connexion:', connectionError);
    ws.close(1011, 'Erreur serveur');
  }
});


module.exports = { wss, server, activeRooms, pendingNotifications };
