import axios from 'axios';

const searchUsers = async (pseudo, method = 'contains') => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/profile/search/${encodeURIComponent(pseudo)}`, {
            params: { method },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Search users failed:', error);
        throw error;
    }
}

export default {
    searchUsers
};