<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Conversation from '@/composables/useConversations';
import Message from '@/composables/useMessages';
import Enc from '@/composables/useEncryption';
import { useWebSocketStore } from '@/stores/websocket';
import { toast } from 'vue3-toastify';

const props = defineProps({
    id: {
        type: [String, Number],
        required: true,
    },
});
const conversationId = parseInt(props.id, 10);
const router = useRouter();
const websocket = useWebSocketStore();
const messages = ref([]);
const isLoadingMore = ref(false);
const isScrollLocked = ref(false);
const typingUsers = ref(new Set());
const newMessage = ref('');
const loading = ref(true);
const error = ref('');
const userId = ref(localStorage.getItem('user_id'));
const conversation = ref(null);
const oldestMessageId = ref(null);
const messagesContainer = ref(null);
const isDecrypting = ref(false);
const placeholderHeight = ref(0);

// Animation de déchiffrement
async function animateDecryption() {
    isDecrypting.value = true;
    await nextTick();
    const sortedMessages = [...messages.value].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    messages.value.forEach(msg => {
        msg.showDecrypted = false;
        msg.showEncoded = true;
    });
    for (let i = 0; i < sortedMessages.length; i++) {
        const msg = sortedMessages[i];
        const originalMsg = messages.value.find(m => m.message_id === msg.message_id);
        if (originalMsg) {
            setTimeout(() => {
                if (originalMsg) {
                    originalMsg.showEncoded = false;
                    originalMsg.showDecrypted = true;
                }
            }, i * 150);
        }
    }
    setTimeout(() => {
        isDecrypting.value = false;
    }, sortedMessages.length * 150 + 500);
}

// Charger la conversation
async function loadConversation() {
    loading.value = true;
    error.value = '';
    try {
        const conv = await Conversation.getConversation(conversationId);
        if (!conv) {
            error.value = 'Conversation introuvable';
            router.replace('/');
            return;
        }
        if (
            String(userId.value) != String(conv.creator_id) &&
            String(userId.value) != String(conv.participant_id)
        ) {
            router.replace('/');
            return;
        }
        conversation.value = conv;
        const convMessages = await Message.getMessages(conversationId);
        messages.value = convMessages.map(msg => ({
            ...msg,
            showDecrypted: false,
            showEncoded: true
        }));
        oldestMessageId.value = messages.value.length ? messages.value[messages.value.length - 1].message_id : null;
        if (messages.value.length > 0) {
            const date = new Date(messages.value[0].timestamp);
            const timestamp = Math.floor(date.getTime() / 1000);
            saveLastMessageTimestamp(conversationId, timestamp);
        }
        setTimeout(() => {
            animateDecryption();
        }, 300);
        loading.value = false;
        scrollToBottom();
    } catch (err) {
        if (err.message == "Invalid base64 key") {
            let value = localStorage.getItem(`wrong_key`);
            if (value) {
                localStorage.setItem(`wrong_key`, parseInt(value) + 1);
            } else {
                localStorage.setItem(`wrong_key`, '1');
            }
        }
        error.value = 'Erreur lors du chargement.';
        router.replace('/');
    }
}

// Faire défiler vers le bas
function scrollToBottom() {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
}

const textarea = ref(null);

function adjustTextareaHeight() {
    if (textarea.value) {
        textarea.value.style.height = 'auto';
        textarea.value.style.height = `${Math.min(textarea.value.scrollHeight, 150)}px`;
    }
}

// Écouter les nouveaux messages du socket
function setupSocket() {
    websocket.$subscribe((mutation, state) => {
        if (mutation.storeId === 'websocket' && mutation.events && mutation.events.length) {
            // Code existant pour le socket
        }
    });
    if (websocket.socket) {
        websocket.socket.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "newMessage" && data.data.conversationId == conversationId) {
                    const newMsg = {
                        conversation_id: data.data.conversationId,
                        sender_id: data.data.sender.user_id,
                        message_content: data.data.messageContent,
                        timestamp: new Date(data.data.timestamp),
                        pseudo: data.data.sender.pseudo,
                        message_decrypted: await Enc.decryptMessage(data.data.messageContent, localStorage.getItem('conversation_' + conversationId + '_key')),
                        showDecrypted: true,
                        showEncoded: false
                    };
                    messages.value.unshift(newMsg);
                    saveLastMessageTimestamp(conversationId, Math.floor(data.data.timestamp / 1000));
                    setTimeout(scrollToBottom, 100);
                }
                if (data.type === 'userTyping' && data.data.userId != userId.value && data.data.conversationId == conversationId) {
                    typingUsers.value.add(data.data.userId);
                }
                if (data.type === 'userStoppedTyping' && data.data.userId != userId.value && data.data.conversationId == conversationId) {
                    typingUsers.value.delete(data.data.userId);
                }
                if (data.type === "newMessage" && data.data.conversationId != conversationId) {
                    console.log(`/conversation/${data.data.conversationId}`)
                    toast.info(`Nouveau message de ${data.data.sender.pseudo}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        onClick: () => {
                            router.push(`/conversations/${data.data.conversationId}`).then(() => {
                                router.go(0); // Recharge la page
                            });
                        },
                    });
                }

            } catch (e) {
                console.error("Erreur de parsing du message:", e);
            }
        };
    }

}

// Envoyer un message
async function sendMessage() {
    if (!newMessage.value.trim()) return;
    const messageContent = newMessage.value.trim();
    newMessage.value = '';
    try {
        await Message.sendMessage(conversationId, messageContent);
    } catch (err) {
        console.error("Erreur lors de l'envoi du message:", err);
        newMessage.value = messageContent;
    }
}

async function loadMore() {
    if (isLoadingMore.value || !oldestMessageId.value || isScrollLocked.value) return;
    isLoadingMore.value = true;
    isScrollLocked.value = true;
    placeholderHeight.value = 200; // Hauteur du placeholder

    const container = messagesContainer.value;
    const currentScrollHeight = container.scrollHeight;
    const currentScrollTop = container.scrollTop;

    try {
        const more = await Message.loadMoreMessages(conversationId, oldestMessageId.value);
        if (more && more.length) {
            const newMessages = more.map(msg => ({
                ...msg,
                showDecrypted: false,
                showEncoded: true
            }));
            messages.value = [...messages.value, ...newMessages];
            oldestMessageId.value = more[more.length - 1].message_id;

            await nextTick();
            placeholderHeight.value = 0;
            await nextTick();

            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - currentScrollHeight + currentScrollTop;

            setTimeout(() => {
                animateDecryption();
            }, 100);
        }
    } catch (err) {
        error.value = 'Erreur lors du chargement des anciens messages.';
    } finally {
        isLoadingMore.value = false;
        setTimeout(() => {
            isScrollLocked.value = false;
        }, 500);
    }
}

function handleScroll() {
    const container = messagesContainer.value;
    if (!container || isLoadingMore.value || isScrollLocked.value) return;
    const scrollPosition = Math.abs(- container.scrollHeight + container.clientHeight - container.scrollTop);
    if (scrollPosition < 200) {
        loadMore();
    }
}

async function sendTypingEvent() {
    await Message.typingMessage(conversationId);
}

onMounted(async () => {
    await loadConversation();
    setupSocket();
    if (messagesContainer.value) {
        messagesContainer.value.addEventListener('scroll', handleScroll);
    }
});

onUnmounted(() => {
    if (messagesContainer.value) {
        messagesContainer.value.removeEventListener('scroll', handleScroll);
    }
});

// Fonction pour retourner en arrière
function goBack() {
    router.push('/');
}

function saveLastMessageTimestamp(conversationId, lastMessageId) {
    localStorage.setItem(`last_message_conversation_${conversationId}`, lastMessageId);
}
</script>

<template>
    <Suspense>
        <template #default>
            <div class="max-w-md mx-auto p-6 my-8 flex flex-col h-[calc(100vh-100px)]"
                style="background-color: var(--background); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div class="relative">
                    <button @click="goBack"
                        class="goback absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
                        style="background-color: var(--highlight-tempered); color: var(--white);">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 class="text-2xl font-bold text-center items-center" style="color: var(--white);">
                        Conversation
                    </h1>
                </div>

                <h1 class="text-2xl font-bold text-center items-center mb-6" style="color: var(--white);">
                    <span style="color: var(--higtlight);">
                        {{ conversation && (userId == conversation.creator_id ? conversation.participant_pseudo :
                            conversation.creator_pseudo) }}
                    </span>
                </h1>

                <div v-if="error" class="p-4 text-center text-sm" style="color: var(--white); opacity: 0.7;">
                    {{ error }}
                </div>
                <div v-if="loading" class="p-4 text-center text-sm" style="color: var(--white); opacity: 0.7;">
                    Chargement des messages...
                </div>
                <div v-else class="flex flex-col flex-1 overflow-hidden">
                    <!-- Conteneur des messages avec scroll personnalisé -->
                    <div ref="messagesContainer"
                        class="flex-1 overflow-y-auto mb-4 space-y-2 px-2 py-2 custom-scrollbar flex-col-reverse flex"
                        :class="{ 'overflow-hidden': isScrollLocked }"
                        style="border: 1px solid var(--higtlight); border-radius: 0.5rem;">
                        <!-- Placeholder pour stabiliser la hauteur pendant le chargement -->
                        <div v-if="isLoadingMore" class="w-full flex justify-center items-center py-4"
                            :style="{ height: `${placeholderHeight}px` }">
                            <span class="text-sm" style="color: var(--white); opacity: 0.7;">Chargement des anciens
                                messages...</span>
                        </div>

                        <div v-for="(msg, index) in messages" :key="msg.message_id || msg.timestamp"
                            class="p-2 rounded-lg transition-all duration-300 my-2 relative" :style="{
                                'background-color': userId == msg.sender_id ?
                                    'rgba(255, 154, 60, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                'border-left': userId == msg.sender_id ?
                                    '3px solid var(--higtlight)' : '3px solid transparent'
                            }">
                            <div class="flex items-start justify-between">
                                <span class="font-bold mr-2 text-sm" :style="{
                                    color: userId == msg.sender_id ?
                                        'var(--higtlight)' : 'var(--white)'
                                }">
                                    {{ userId == msg.sender_id ? 'Moi' :
                                        (userId == conversation.creator_id ?
                                            conversation.participant_pseudo : conversation.creator_pseudo) }}
                                </span>
                                <span class="text-xs capitalize ml-2 opacity-50 shrink-0" style="color: var(--white);">
                                    {{ (index === 0 || !isSameDay(msg.timestamp, messages[index - 1].timestamp)) ?
                                        formatDateHeader(msg.timestamp) : '' }}
                                    {{ new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit', minute:
                                            '2-digit'
                                    }) }}
                                </span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div v-if="msg.showEncoded" class="text-xs italic opacity-70"
                                    style="color: var(--white); word-break: break-word;">
                                    {{ msg.message_content }}
                                </div>
                                <div v-if="msg.showDecrypted" class="word-break-break-word wrap-break-word"
                                    style="color: var(--white);">
                                    {{ msg.message_decrypted }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="typingUsers.size > 0" class="text-xs text-center p-1"
                        style="color: var(--white); opacity: 0.7;">
                        {{ conversation && (userId == conversation.creator_id ? conversation.participant_pseudo :
                            conversation.creator_pseudo) }} est en train d'écrire...
                    </div>
                    <!-- Zone de saisie multiline -->
                    <div class="mt-auto pt-2">
                        <div class="bg-highlight-tempered rounded-lg p-2" style="border: 1px solid var(--higtlight);">
                            <textarea v-model="newMessage" placeholder="Votre message..."
                                class="w-full bg-transparent outline-none resize-none min-h-[44px] max-h-[150px] overflow-y-auto custom-scrollbar-textarea"
                                style="color: var(--white);"
                                @input="() => { adjustTextareaHeight(); sendTypingEvent(); }" ref="textarea"></textarea>
                            <div class="flex justify-end mt-1">
                                <button @click="sendMessage" :disabled="!newMessage.trim()"
                                    class="px-4 py-1.5 rounded-md font-medium text-sm"
                                    :class="{ 'opacity-50': !newMessage.trim() }"
                                    style="background-color: var(--higtlight); color: var(--background); border: 1px solid var(--higtlight);">
                                    Envoyer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #fallback>
            <div class="max-w-md mx-auto p-6 my-8 text-center" style="color: var(--white); opacity: 0.8;">
                Chargement de la conversation...
            </div>
        </template>
    </Suspense>
</template>

<script>
export default {
    methods: {
        isSameDay(timestamp1, timestamp2) {
            const date1 = new Date(timestamp1);
            const date2 = new Date(timestamp2);
            return date1.toDateString() === date2.toDateString();
        },
        formatDateHeader(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            if (date.toDateString() === now.toDateString()) {
                return "";
            }
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (date.toDateString() === yesterday.toDateString()) {
                return "Hier";
            }
            return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--higtlight);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 154, 60, 0.8);
}

.custom-scrollbar-textarea::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar-textarea::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar-textarea::-webkit-scrollbar-thumb {
    background: var(--higtlight);
    border-radius: 3px;
}

.custom-scrollbar-textarea::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 154, 60, 0.8);
}

textarea {
    line-height: 1.4;
    padding: 8px 0;
    white-space: pre-wrap;
    word-break: break-word;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-fade-in {
    animation: fadeIn 0.3s ease-out;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

button:disabled {
    cursor: not-allowed;
}

.goback:hover {
    background-color: var(--higtlight) !important;
    color: var(--background) !important;
}
</style>
