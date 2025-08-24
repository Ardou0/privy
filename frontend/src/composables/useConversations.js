import axios from 'axios';
const token = localStorage.getItem('token'); // Assuming you store the token in localStorage

const getConversations = async () => {
    try {
        const response = await axios.get('/api/conversations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        throw error;
    }
}

const getInvitations = async () => {
    try {
        const response = await axios.get('/api/conversations/invitations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch invitations:', error);
        throw error;
    }
}


const getConversation = async (conversationId) => {
    try {
        const response = await axios.get(`/api/conversations/${conversationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        throw error;
    }
}


export default {
    getConversations,
    getInvitations,
    getConversation
}