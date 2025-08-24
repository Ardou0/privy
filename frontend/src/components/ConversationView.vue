<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Conversation from '@/composables/useConversations';
import Message from '@/composables/useMessages';
import { useWebSocketStore } from '@/stores/websocket';

const props = defineProps({
    id: {
        type: [String, Number], // Accepte les deux types
        required: true,
    },
});

const conversationId = parseInt(props.id, 10); // Conversion explicite en entier

const router = useRouter();
const websocket = useWebSocketStore();
const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);
const error = ref('');
const userId = ref(localStorage.getItem('user_id'));
const conversation = ref(null);
const oldestMessageId = ref(null);

// Load initial messages and check if user is in the conversation
async function loadConversation() {
    loading.value = true;
    error.value = '';
    try {
        // Get all messages and conversation info
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
        messages.value = convMessages.sort((a, b) => a.id - b.id); // oldest first
        oldestMessageId.value = messages.value.length ? messages.value[0].id : null;
        loading.value = false;
    } catch (err) {
        error.value = 'Erreur lors du chargement.';
        router.replace('/');
    }
}

// Listen for new messages from socket
function setupSocket() {
    websocket.$subscribe((mutation, state) => {
        if (mutation.storeId === 'websocket' && mutation.events && mutation.events.length) {
            // ...existing code...
        }
    });
    if (websocket.socket) {
        websocket.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.conversation_id == conversationId) { // Utilisation directe de l'entier
                    messages.value.push(data);
                }
            } catch (e) { }
        };
    }
}

async function sendMessage() {
    if (!newMessage.value.trim()) return;
    Message.sendMessage(conversationId, newMessage.value.trim());
    newMessage.value = '';
}

async function loadMore() {
    if (!oldestMessageId.value) return;
    try {
        const more = await Conversation.loadMoreMessages(conversationId, oldestMessageId.value); // Utilisation directe de l'entier
        if (more && more.length) {
            messages.value = [...more.sort((a, b) => a.id - b.id), ...messages.value];
            oldestMessageId.value = more[0].id;
        }
    } catch (err) {
        error.value = 'Erreur lors du chargement des anciens messages.';
    }
}

onMounted(async () => {
    await loadConversation();
    setupSocket();
});
</script>


<template>
    <Suspense>
        <template #default>
            <div class="max-w-md mx-auto p-6 my-8"
                style="background-color: var(--background); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 class="text-2xl font-bold mb-6 text-center" style="color: var(--white);">
                    Conversation avec
                    <span style="color: var(--higtlight);">
                        {{ conversation && (userId == conversation.creator_id ? conversation.participant_pseudo :
                            conversation.creator_pseudo) }}
                    </span>
                </h1>
                <div v-if="error" class="p-4 text-center text-sm" style="color: var(--white); opacity: 0.7;">{{ error }}
                </div>
                <div v-if="loading" class="p-4 text-center text-sm" style="color: var(--white); opacity: 0.7;">
                    Chargement des messages...</div>
                <div v-else>
                    <button @click="loadMore" class="mb-2 px-3 py-1 rounded"
                        style="background-color: var(--highlight-tempered); color: var(--white);">Charger plus</button>
                    <ul class="rounded-lg overflow-hidden mb-4"
                        style="border: 1px solid var(--higtlight); max-height: 350px; overflow-y: auto;">
                        <li v-for="msg in messages" :key="msg.id || msg.created_at" class="p-2"
                            style="border-bottom: 1px solid var(--highlight-tempered); color: var(--white);">
                            <span :style="{ color: userId == msg.sender_id ? 'var(--higtlight)' : 'var(--white)' }">
                                <b>{{ userId == msg.sender_id ? 'Moi' : (userId == conversation.creator_id ?
                                    conversation.participant_pseudo : conversation.creator_pseudo) }}</b>
                            </span>
                            : {{ msg.message_content }}
                            <span class="text-xs" style="opacity:0.5; float:right;">{{ new
                                Date(msg.created_at).toLocaleTimeString() }}</span>
                        </li>
                    </ul>
                    <form @submit.prevent="sendMessage" class="flex gap-2">
                        <input v-model="newMessage" type="text" placeholder="Votre message..."
                            class="flex-1 px-3 py-2 rounded-md shadow-sm border-none focus:ring-2"
                            style="background-color: var(--highlight-tempered); color: var(--white); border: 1px solid var(--higtlight);">
                        <button type="submit" class="px-4 py-2 rounded-md font-medium"
                            style="background-color: var(--higtlight); color: var(--background); border: 1px solid var(--higtlight);">Envoyer</button>
                    </form>
                </div>
            </div>
        </template>
        <template #fallback>
            <div class="max-w-md mx-auto p-6 my-8 text-center" style="color: var(--white); opacity: 0.8;">Chargement de
                la conversation...</div>
        </template>
    </Suspense>
</template>


<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>