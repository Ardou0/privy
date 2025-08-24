import axios from 'axios';
import { useWebSocketStore } from '@/stores/websocket';
const token = localStorage.getItem('token'); // Assuming you store the token in localStorage

async function decryptMessages(messages, keyString) {
    return Promise.all(
        messages.map(async msg => {
            try {
                msg.message_content = await decryptMessage(msg.message_content, keyString);
            } catch (e) {
                msg.message_content = '[Erreur de déchiffrement]';
            }
            return msg;
        })
    );
}

const getMessages = async (conversationId) => {
    try {
        const response = await axios.get(`/api/conversations/${conversationId}/messages/1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const keyString = localStorage.getItem(`conversations_${conversationId}_key`);
        return await decryptMessages(response.data, keyString);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        throw error;
    }
}

const loadMoreMessages = async (conversationId, beforeMessageId) => {
    try {
        const response = await axios.get(`/api/conversations/${conversationId}/messages/${beforeMessageId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const keyString = localStorage.getItem(`conversations_${conversationId}_key`);
        return await decryptMessages(response.data, keyString);
    } catch (error) {
        console.error('Failed to load more messages:', error);
        throw error;
    }
}

const sendMessage = async (conversationId, messageContent) => {
    try {
        const keyString = localStorage.getItem(`conversations_${conversationId}_key`);
        if (!keyString) throw new Error('Clé de chiffrement manquante');

        const encrypted = await encryptMessage(messageContent, keyString);
        const payload = {
            type: 'sendMessage',
            data: { conversationId, encrypted }
        }

        useWebSocketStore().sendMessage(payload);
        return response.data;
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
}

export default {
    getMessages,
    loadMoreMessages,
    sendMessage
};