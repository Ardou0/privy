// src/stores/websocket.js
import { defineStore } from 'pinia';
import { toast } from 'vue3-toastify';
import auth from '@/composables/useAuth';

export const useWebSocketStore = defineStore('websocket', {
    state: () => ({
        socket: null,
        messages: [],
        isConnected: false,
        toastId: null,
        errorLive: ['Le serveur live est inaccessible. Tentative de reconnexion...', 3000],
        errorToken: ['Le token est manquant ou invalide. Veuillez vous reconnecter.', 5000],
    }),
    actions: {
        // Méthode pour afficher le toast (si ce n'est pas déjà fait)
        showErrorToast(error) {
            if (this.toastId) return; // Toast déjà affiché

            this.toastId = toast.error(error[0], {
                autoClose: error[1],
                closeOnClick: false,
                hideProgressBar: true,
                closeButton: false,
                draggable: false,
                pauseOnHover: false,
                pauseOnFocusLoss: false,
                selectable: false,
                position: 'top-left',
                toastId: 'ws-unreachable',
            });

            setTimeout(() => {
                this.toastId = null; // Réinitialiser l'ID du toast après 5 secondes
                if (error === this.errorToken) {
                    window.location.href = '/';
                }
            }, error[1]);
        },

        async connect() {
            if (this.isConnected && this.socket) {
                console.log("Déjà connecté au WebSocket.");
                return;
            }
            if (this.socket) {
                this.socket.close();
                this.socket = null;
            }
            let url = import.meta.env.VITE_WEBSOCKET_URL;
            console.log("Connexion au WebSocket à l'URL:", );
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.showErrorToast(this.errorToken);
                    return;
                }
                this.socket = new WebSocket(`${url}?token=${encodeURIComponent(token)}`);
                this.socket.onopen = () => {
                    this.isConnected = true;
                    console.log('WebSocket connecté !');
                };
                this.socket.onmessage = (event) => {
                    this.messages.push(event.data);
                };
                this.socket.onclose = (event) => {
                    this.isConnected = false;
                    // Check close reason for token issues
                    const tokenCloseCodes = [1008, 4001];
                    if (tokenCloseCodes.includes(event.code) || (event.reason && event.reason.toLowerCase().includes('token'))) {
                        console.warn('WebSocket fermé pour raison de token:', event.reason);
                        this.showErrorToast(this.errorToken);
                        // Stop reconnecting, trigger client-side token verification
                        if (auth && typeof auth.checkAuth === 'function') {
                            auth.checkAuth();
                        }
                        return;
                    }
                    console.log('WebSocket déconnecté. Tentative de reconnexion dans 5 secondes...');
                    this.showErrorToast(this.errorLive);
                    setTimeout(() => this.connect(), 5000);
                };
                this.socket.onerror = (error) => {
                    console.error('Erreur WebSocket :', error);
                    this.showErrorToast(this.errorLive);
                };
            } catch (error) {
                console.error('Erreur lors de la vérification du token:', error);
                this.showErrorToast(this.errorToken);
            }
        },


        disconnect() {
            if (this.socket) {
                this.socket.close();
                this.socket = null;
                this.isConnected = false;
            }
        },

        sendMessage(message) {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(message));
            } else {
                console.error("WebSocket non connecté, message non envoyé.");
            }
        },

        reconnect() {
            this.disconnect();
            this.connect();
        },
    },
});
