import axios from 'axios';
import { useWebSocketStore } from '../stores/websocket';

const login = async ({ nickname, password }) => {
    try {
        const response = await axios.post('/api/auth/login', {
            pseudo: nickname,
            password: password
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return true;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

const logout = () => {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('publicKey');
        localStorage.removeItem('privateKey');
        // Supprimer toutes les clés de conversation
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('conversation_') && key.endsWith('_key')) {
                localStorage.removeItem(key);
            }
        });
        window.location.href = '/login'; // Rediriger vers la page de login
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
};

const register = async (nickname, password, pubKey) => {
    try {
        const response = await axios.post('/api/auth/register', {
            pseudo: nickname,
            password: password,
            public_key: pubKey,
        });
        if (response.data.user_id) {
            return true;
        }
        else {
            return false;
        }
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
}

const checkAuth = async () => {
    console.log('Checking authentication...');
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }
    try {
        const response = await axios.get('/api/auth/check', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 200) {
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('pseudo', response.data.pseudo);
            const websocket = useWebSocketStore();
            await websocket.connect(); // Attendre la connexion
            return true;
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('pseudo');
            const websocket = useWebSocketStore();
            websocket.disconnect();
            return false;
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('pseudo');
        const websocket = useWebSocketStore();
        websocket.disconnect();
        return false;
    }
}


export default {
    login,
    logout,
    register,
    checkAuth,
};