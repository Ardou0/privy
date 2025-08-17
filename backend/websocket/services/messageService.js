const axios = require('axios');
const addNotification = require('../services/notificationService');
require('dotenv').config();
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const handleMessage = async (ws, { conversationId, messageContent }, activeRooms, pendingNotifications) => {
    const room = activeRooms.get(conversationId);
    if (!room) {
        console.error(`Aucune room active pour l'ID : ${conversationId}`);
        return;
    }
    const senderId = ws.user.user_id;
    if (!conversationId || !messageContent) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: 'Conversation ID et contenu du message sont requis.' }
        }));
        return;
    }
    try {
        const token = ws.user.token;
        await axios.post(
            `${API_URL}/conversations/${conversationId}/messages`,
            { messageContent },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const message = {
            type: 'newMessage',
            data: {
                conversationId,
                senderId,
                messageContent,
                timestamp: Date.now()
            }
        };
        const room = activeRooms.get(conversationId);
        if (!room) {
            console.error(`Aucune room active pour l'ID : ${conversationId}`);
            return;
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
