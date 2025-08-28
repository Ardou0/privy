import axios from 'axios';
import Enc from '@/composables/useEncryption';
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
        const response = await axios.get(`/api/conversations/${conversationId}/messages/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const keyString = localStorage.getItem('conversation_' + conversationId + '_key');

        if (response.data.length === 0) return [];

        const decryptedMessages = await Promise.all(
            response.data.map(async (element) => {
                const decrypted = await Enc.decryptMessage(element.message_content, keyString);
                return { ...element, message_decrypted: decrypted };
            })
        );

        return decryptedMessages;
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        throw error;
    }
};


const loadMoreMessages = async (conversationId, beforeMessageId) => {
    try {
        const response = await axios.get(`/api/conversations/${conversationId}/messages/${beforeMessageId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const keyString = localStorage.getItem('conversation_' + conversationId + '_key');

        if (response.data.length === 0) return [];
        
        const decryptedMessages = await Promise.all(
            response.data.map(async (element) => {
                const decrypted = await Enc.decryptMessage(element.message_content, keyString);
                return { ...element, message_decrypted: decrypted };
            })
        );

        return decryptedMessages;

        return await Enc.decryptMessage(response.data, keyString);
    } catch (error) {
        console.error('Failed to load more messages:', error);
        throw error;
    }
}

const sendMessage = async (conversationId, messageContent) => {
    try {
        const keyString = localStorage.getItem('conversation_' + conversationId + '_key');
        if (!keyString) throw new Error('Clé de chiffrement manquante');

        const encrypted = await Enc.encryptMessage(messageContent, keyString);
        const payload = {
            type: 'sendMessage',
            data: { conversationId, messageContent: encrypted }
        }

        useWebSocketStore().sendMessage(payload);
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
}

const typingMessage = async (conversationId) => {
    try {
        const payload = {
            type: 'userTyping',
            data: { conversationId }
        }
        useWebSocketStore().sendMessage(payload);
    } catch (error) {
        console.error('Failed to send typing message:', error);
        throw error;
    }
}

export default {
    getMessages,
    loadMoreMessages,
    sendMessage,
    typingMessage
};