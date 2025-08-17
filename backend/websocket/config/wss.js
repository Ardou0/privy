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
wss.on('connection', (ws, req) => {
  // Récupérer le token depuis les headers ou l'URL
  const token = process.env.PROD === 'true'
    ? req.headers['sec-websocket-protocol']?.split('Bearer ')[1]
    : new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');

  if (!token) {
    ws.close(1008, 'Token manquant');
    return;
  }

  verifyToken(token, async (err, user) => {
    if (err) {
      ws.close(1008, 'Token invalide');
      return;
    }
    user.token = token; // Stocker le token dans l'objet utilisateur
    ws.user = user;
    const { data } = await axios.get(`${process.env.API_URL}/conversations/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    data.forEach(conversation => {
      const convId = String(conversation.conversation_id); // Force en string
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
      const message = JSON.parse(data);
      switch (message.type) {
        case 'sendMessage':
          await messageService.handleMessage(ws, message.data, activeRooms, pendingNotifications);
          break;
        case 'typing':
          typingService.handleTyping(ws, message.conversationId, activeRooms);
          break;
        case 'joinConversation':
          ws.conversationId = message.conversationId;
          break;
      }
    });

    ws.on('close', () => {
      activeConnections.delete(ws.user.user_id);
      console.log(`Utilisateur déconnecté: ${ws.user.user_id}`);
    });
  });
});

module.exports = { wss, server, activeRooms, pendingNotifications };
