import axios from 'axios';
import useEncryption from './useEncryption';
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

const sendInvitation = async (username, recipientPublicKey) => {
    try {
        // Generate symmetric key
        const symmetricKey = await useEncryption.generateSymmetricKey();
        // Encrypt symmetric key with recipient's public key
        const encryptedKey = await useEncryption.encryptKey(symmetricKey, recipientPublicKey);
        // Send invitation via API
        const response = await axios.post(`/api/conversations/invite`, {
            pseudo: username,
            key: encryptedKey
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status == 201) {
            console.log(response.data.invitation_id)
            localStorage.setItem('awaiting_invitation_'+username, symmetricKey);
            return true;
        } else {
            console.error('Invitation failed:', response.data.error || response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error sending invitation:', error);
        return false;
    }
}

const acceptInvitation = async (invitationId, encryptedKey) => {
    try {
        let symmetricKey = await useEncryption.decryptKey(encryptedKey);
        console.log("Symmetric key decrypted:", symmetricKey);
        const response = await axios.post(`/api/conversations/invitations/${invitationId}/respond`, {
            response: 'accepted'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status == 201) {
            localStorage.setItem(`conversation_${response.data.conversation_id}_key`, symmetricKey);
            return response.data.conversation_id;
        } else {
            console.error('Accepting invitation failed:', response.data.error || response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return null;
    }
}

const declineInvitation = async (invitationId) => {
    try {
        const response = await axios.post(`/api/conversations/invitations/${invitationId}/respond`, {
            response: 'declined'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status == 200) {
            return true;
        } else {
            console.error('Declining invitation failed:', response.data.error || response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error declining invitation:', error);
        return false;
    }
}

export default {
    getConversations,
    getInvitations,
    getConversation,
    sendInvitation,
    acceptInvitation,
    declineInvitation
}