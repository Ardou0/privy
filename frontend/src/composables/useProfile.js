import axios from 'axios';
import File from './useFiles';

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
};

const updatePassword = async (_old, _new) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`/api/profile/update`, {
            password: _old,
            new_password: _new
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.status === 200;
    } catch (error) {
        console.error('Update password failed:', error);
        throw error;
    }
};

const downloadConversationsKeys = async () => {
    try {
        let pemContent = '';
        // Récupérer toutes les clés de conversation
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('conversation_') && key.endsWith('_key')) {
                const value = localStorage.getItem(key);
                pemContent += `-----BEGIN CONVERSATION KEY ${key}-----\n${value}\n-----END CONVERSATION KEY ${key}-----\n\n`;
            }
        }
        if (!pemContent) {
            throw new Error("Aucune clé de conversation trouvée.");
        }

        const fileName = 'conversations_keys_backup.pem';

        await File.downloadFile(pemContent, fileName);

        return true;
    } catch (error) {
        console.error('Téléchargement des clés échoué:', error);
        throw error;
    }
};

const loadPairedKeys = async (file) => {
    try {
        let content = await File.readFile(file);
        const publicKeyMatch = content.match(/-----BEGIN PUBLIC KEY-----[\s\S]+?-----END PUBLIC KEY-----/);
        const privateKeyMatch = content.match(/-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/);
        if (!publicKeyMatch || !privateKeyMatch) {
            throw new Error("Format de fichier PEM invalide.");
        }

        const cleanKey = (key) =>
            key
                .replace(/-----BEGIN (PUBLIC|PRIVATE) KEY-----/, '')
                .replace(/-----END (PUBLIC|PRIVATE) KEY-----/, '')
                .replace(/\s+/g, '');

        localStorage.setItem('publicKey', cleanKey(publicKeyMatch[0]));
        localStorage.setItem('privateKey', cleanKey(privateKeyMatch[0]));
        return true;
    } catch (error) {
        console.error('Chargement des clés échoué:', error);
        throw error;
    }
};

const loadConversationsKeys = async (file) => {
    try {
        let content = await File.readFile(file);

        const keyRegex = /-----BEGIN CONVERSATION KEY (conversation_[^ ]+)-----[\s\S]+?-----END CONVERSATION KEY \1-----/g;
        let match;
        while ((match = keyRegex.exec(content)) !== null) {
            const keyName = match[1];
            const keyValue = match[0]
                .replace(`-----BEGIN CONVERSATION KEY ${keyName}-----`, '')
                .replace(`-----END CONVERSATION KEY ${keyName}-----`, '')
                .trim();
            localStorage.setItem(keyName, keyValue);
        }
        return true;
    } catch (error) {
        console.error('Chargement des clés échoué:', error);
        throw error;
    }
};

const deactivateAccount = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`/api/profile/remove`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.status === 200;
    } catch (error) {
        console.error('Désactivation du compte échouée:', error);
        throw error;
    }
};

const toggleHide = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/profile/hide`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.status === 200 ? { result: response.data.hide } : false;
    } catch (error) {
        console.error("Changement de visibilité échoué :", error);
        throw error;
    }
};

export default {
    searchUsers,
    updatePassword,
    loadPairedKeys,
    loadConversationsKeys,
    downloadConversationsKeys,
    deactivateAccount,
    toggleHide
};
