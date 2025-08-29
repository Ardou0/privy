const axios = require('axios');
const addNotification = require('../services/notificationService');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const handleMessage = async (ws, { conversationId, messageContent }, activeRooms, pendingNotifications) => {
    const room = await activeRooms.get(String(conversationId));
    if (!room) {
        console.error(`Aucune room active pour l'ID : ${conversationId}`);
        return;
    }
    const senderId = ws.user.user_id;
    const senderPseudo = ws.user.pseudo;
    if (!conversationId || !messageContent) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: 'Conversation ID et contenu du message sont requis.' }
        }));
        return;
    }
    try {
        if (!await isLikelyEncrypted(messageContent)) {
            ws.send(JSON.stringify({
                type: 'error',
                data: { message: 'Le message ne semble pas être chiffré correctement.' }
            }));
            ws.close(1000, 'Message non chiffré');
            return;
        }
        const token = ws.user.token;
        const messageToken = jwt.sign({ origin: 'message' }, process.env.MESSAGE_TOKEN_SECRET, { expiresIn: process.env.MESSAGE_TOKEN_EXPIRATION })
        await axios.post(
            `${API_URL}/conversations/${conversationId}/messages`,
            { messageContent },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Authorization-origin': `Bearer ${messageToken}`
                }
            }
        );
        const message = {
            type: 'newMessage',
            data: {
                conversationId,
                sender: { user_id: senderId, pseudo: senderPseudo },
                messageContent,
                timestamp: Date.now()
            }
        }
        room.forEach((client, userId) => {
            client.send(JSON.stringify(message));
            console.log(`Message envoyé à l'utilisateur ${userId} dans la conversation ${conversationId}`);
        });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du message:', error.message);
        ws.send(JSON.stringify({
            type: 'error',
            data: {
                message: "Votre message a été envoyé aux destinataires connectés, mais n'a pas pu être enregistré en base de données. Veuillez réessayer plus tard.",
                error: error.message
            }
        }));
    }
};

module.exports = { handleMessage };

// Other functions for payload verification

function isLikelyEncrypted(payload) {
    // 1. Vérifier que c'est du Base64 valide
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(payload)) {
        console.log('Not valid Base64');
        return false;
    }

    // 2. Décoder le Base64
    let decoded;
    try {
        decoded = Buffer.from(payload, 'base64');
    } catch (e) {
        console.log('Failed to decode Base64');
        return false;
    }

    // 3. Vérifier la taille minimale (IV 12 + tag 16 = 28 octets)
    if (decoded.length < 28) {
        console.log('Payload too short for AES-GCM (IV + tag)');
        return false;
    }

    // 4. Vérifier l'entropie (optionnel mais recommandé)
    const entropy = calculateEntropy(decoded);
    return entropy > 4.0;
}

function calculateEntropy(buffer) {
    if (buffer.length === 0) {
        return 0;
    }
    const freq = {};
    buffer.forEach(byte => {
        freq[byte] = (freq[byte] || 0) + 1;
    });
    let entropy = 0;
    Object.values(freq).forEach(count => {
        const p = count / buffer.length;
        entropy -= p * Math.log2(p);
    });
    return entropy;
}
