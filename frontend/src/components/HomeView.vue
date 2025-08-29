<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Conversation from '@/composables/useConversations'
import { toast } from 'vue3-toastify'

const router = useRouter()
const searchQuery = ref('')
const conversations = ref([])
const invitations = ref([])
const activeTab = ref('conversations')
const showAcceptConfirmation = ref(false)
const showRejectConfirmation = ref(false)
const selectedInvitation = ref(null)

// Fonction pour formater les dates
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    const diff = Math.floor((now - date) / (1000 * 60 * 60))
    if (diff === 0) {
      const minutes = Math.floor((now - date) / (1000 * 60))
      return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    }
    return `il y a ${diff} heure${diff > 1 ? 's' : ''}`
  }
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function hasNewMessages(conv) {
  const lastMessageId = Math.floor(new Date(conv.last_message).getTime() / 1000);
  const storedLastMessageId = parseInt(localStorage.getItem(`last_message_conversation_${conv.conversation_id}`));
  // Si jamais le localStorage n'a pas encore été défini, on considère qu'il y a un nouveau message
  if (isNaN(storedLastMessageId)) return true;
  return lastMessageId > storedLastMessageId;
}

async function fetchConversations() {
  let data = await Conversation.getConversations()
  data.forEach(conv => {
    const awaitingKey = `awaiting_invitation_${conv.participant_pseudo}`
    const conversationKey = `conversation_${conv.conversation_id}_key`
    const awaitingValue = localStorage.getItem(awaitingKey)
    if (awaitingValue) {
      localStorage.setItem(conversationKey, awaitingValue)
      localStorage.removeItem(awaitingKey)
    }
  })
  conversations.value = data;
  if(localStorage.getItem("wrong_key") && localStorage.getItem("wrong_key") > 1) {
    toast.error("La clé de conversation enregistrée est invalide ou n'existe pas. Veuillez l'importer dans votre profil.", {
      position: "top-right",
      autoClose: 10000,
    });
    localStorage.removeItem("wrong_key");
  }
}

async function fetchInvitations() {
  let data = await Conversation.getInvitations()
  const pendingInvitations = data.filter(invite => invite.status === 'pending')
  invitations.value = pendingInvitations
}

async function acceptInvitation() {
  if (!selectedInvitation.value) return
  try {
    const response = await Conversation.acceptInvitation(
      selectedInvitation.value.invitation_id,
      selectedInvitation.value.payload
    )
    if (response) {
      toast.success(`Invitation de ${selectedInvitation.value.creator_pseudo} acceptée!`, {
        position: "top-right",
        autoClose: 3000,
      })
      closePopups()
      await fetchInvitations()
      await fetchConversations()
    }
  } catch (error) {
    console.error('Erreur lors de l\'acceptation:', error)
    toast.error(`Échec de l'acceptation de l'invitation`, {
      position: "top-right",
      autoClose: 5000,
    })
  }
}

async function rejectInvitation() {
  if (!selectedInvitation.value) return
  try {
    const response = await Conversation.declineInvitation(selectedInvitation.value.invitation_id)
    if (!response) throw new Error('Une erreur est survenue')
    toast.success(`Invitation de ${selectedInvitation.value.creator_pseudo} refusée`, {
      position: "top-right",
      autoClose: 3000,
    })
    closePopups()
    await fetchInvitations()
  } catch (error) {
    console.error('Erreur lors du refus:', error)
    toast.error(`Échec du refus de l'invitation`, {
      position: "top-right",
      autoClose: 5000,
    })
  }
}

function getOtherPseudo(conv) {
  return localStorage.getItem("user_id") == conv.creator_id
    ? conv.participant_pseudo
    : conv.creator_pseudo
}

function openAcceptConfirmation(invite) {
  selectedInvitation.value = invite
  showAcceptConfirmation.value = true
}

function openRejectConfirmation(invite) {
  selectedInvitation.value = invite
  showRejectConfirmation.value = true
}

function closePopups() {
  showAcceptConfirmation.value = false
  showRejectConfirmation.value = false
  selectedInvitation.value = null
}

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  const query = searchQuery.value.toLowerCase()
  return conversations.value.filter(conv =>
    getOtherPseudo(conv).toLowerCase().includes(query)
  )
})

function clearSearch() {
  searchQuery.value = ''
}

// Initialisation
onMounted(() => {
  fetchConversations()
  fetchInvitations()
})
</script>

<template>
  <Suspense>
    <template #default>
      <div class="max-w-md mx-auto p-6 my-8"
        style="background-color: var(--background); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Titre et boutons d'action -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl md:text-4xl font-bold tracking-widest"
            style="font-family: 'Bebas Neue', sans-serif; text-transform: uppercase; letter-spacing: 2px; color: var(--white);">
            Privy
          </h1>
          <div class="flex space-x-2">
            <router-link to="/profile/search" class="p-2 rounded-lg transition-colors"
              style="background-color: var(--highlight-tempered); color: var(--white);">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </router-link>
            <router-link to="/profile" class="p-2 rounded-lg transition-colors"
              style="background-color: var(--highlight-tempered); color: var(--white);">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </router-link>
          </div>
        </div>
        <!-- Onglets avec indicateur d'invitations -->
        <div class="flex w-full rounded-lg overflow-hidden mb-4">
          <button @click="activeTab = 'conversations'"
            class="flex-1 py-2 text-sm font-medium focus:outline-none transition-colors relative" :style="activeTab === 'conversations' ?
              { 'background-color': 'var(--higtlight)', color: 'var(--background)' } :
              { 'background-color': 'var(--highlight-tempered)', color: 'var(--white)' }">
            Conversations
          </button>
          <button @click="activeTab = 'invitations'"
            class="flex-1 py-2 text-sm font-medium focus:outline-none transition-colors relative" :style="activeTab === 'invitations' ?
              { 'background-color': 'var(--higtlight)', color: 'var(--background)' } :
              { 'background-color': 'var(--highlight-tempered)', color: 'var(--white)' }">
            Invitations
            <span v-if="invitations.length > 0"
              class="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500 border-2 border-background"></span>
          </button>
        </div>
        <!-- Barre de recherche -->
        <div v-if="activeTab === 'conversations'" class="mb-4 relative">
          <input v-model="searchQuery" type="text" placeholder="Rechercher une conversation..."
            class="w-full p-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none"
            style="background-color: var(--highlight-tempered); color: var(--white); border: 1px solid var(--higtlight);">
          <button v-if="searchQuery" @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- Contenu -->
        <div class="mt-2">
          <transition name="fade" mode="out-in">
            <div v-if="activeTab === 'conversations'" key="conversations">
              <ul class="rounded-lg overflow-hidden" style="border: 1px solid var(--higtlight);">
                <li v-for="conv in filteredConversations" :key="conv.conversation_id"
                  class="transition-colors hover:bg-highlight-tempered relative" :style="{
                    'border-bottom': '1px solid var(--highlight-tempered)'
                  }">
                  <router-link :to="`/conversations/${conv.conversation_id}`"
                    class="block p-3 text-lg font-medium flex justify-between items-center"
                    style="color: var(--white);">
                    {{ getOtherPseudo(conv) }}
                    <span v-if="hasNewMessages(conv)"
                      class="w-3 h-3 rounded-full bg-red-500 border-2 border-background"></span>
                  </router-link>
                </li>
                <div v-if="filteredConversations.length === 0" class="p-4 text-center text-sm"
                  style="color: var(--white); opacity: 0.7;">
                  Aucune conversation trouvée.
                </div>
              </ul>
            </div>
            <div v-else key="invitations">
              <ul class="space-y-2">
                <li v-for="invite in invitations" :key="invite.invitation_id"
                  class="p-3 rounded-lg hover:bg-opacity-20 transition-colors"
                  style="background-color: var(--highlight-tempered);">
                  <div class="flex justify-between items-center">
                    <div>
                      <span class="text-lg font-medium" style="color: var(--white);">
                        {{ invite.creator_pseudo }}
                      </span>
                      <div class="text-xs mt-1" style="color: var(--white); opacity: 0.7;">
                        {{ formatDate(invite.created_at) }}
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button @click.stop="openRejectConfirmation(invite)" class="text-xs py-1 px-2 rounded-lg"
                        style="background-color: rgba(255, 154, 60, 0.3); color: var(--white); border: 1px solid var(--higtlight);">
                        Refuser
                      </button>
                      <button @click.stop="openAcceptConfirmation(invite)" class="text-xs py-1 px-2 rounded-lg"
                        style="background-color: var(--higtlight); color: var(--background);">
                        Accepter
                      </button>
                    </div>
                  </div>
                </li>
                <div v-if="invitations.length === 0" class="p-4 text-center text-sm"
                  style="color: var(--white); opacity: 0.7;">
                  Aucune invitation en attente.
                </div>
              </ul>
            </div>
          </transition>
        </div>
        <!-- Popup de confirmation d'acceptation -->
        <div v-if="showAcceptConfirmation"
          class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click.self="closePopups">
          <div class="bg-background rounded-lg p-6 max-w-sm w-full mx-4" style="border: 1px solid var(--higtlight);">
            <h2 class="text-xl font-bold mb-4 text-center"
              style="color: var(--white); font-family: 'Bebas Neue', sans-serif;">
              Confirmer l'acceptation
            </h2>
            <p class="text-center mb-6" style="color: var(--white);">
              Voulez-vous vraiment accepter l'invitation de <span class="font-bold">{{
                selectedInvitation?.creator_pseudo }}</span> ?
            </p>
            <div class="flex justify-center space-x-4">
              <button @click="closePopups" class="px-4 py-2 rounded-lg text-white"
                style="background-color: var(--highlight-tempered);">
                Annuler
              </button>
              <button @click="acceptInvitation" class="px-4 py-2 rounded-lg text-background"
                style="background-color: var(--higtlight);">
                Accepter
              </button>
            </div>
          </div>
        </div>
        <!-- Popup de confirmation de refus -->
        <div v-if="showRejectConfirmation"
          class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click.self="closePopups">
          <div class="bg-background rounded-lg p-6 max-w-sm w-full mx-4" style="border: 1px solid var(--higtlight);">
            <h2 class="text-xl font-bold mb-4 text-center"
              style="color: var(--white); font-family: 'Bebas Neue', sans-serif;">
              Confirmer le refus
            </h2>
            <p class="text-center mb-6" style="color: var(--white);">
              Voulez-vous vraiment refuser l'invitation de <span class="font-bold">{{ selectedInvitation?.creator_pseudo
              }}</span> ?
            </p>
            <div class="flex justify-center space-x-4">
              <button @click="closePopups" class="px-4 py-2 rounded-lg text-white"
                style="background-color: var(--highlight-tempered);">
                Annuler
              </button>
              <button @click="rejectInvitation" class="px-4 py-2 rounded-lg text-background"
                style="background-color: rgba(255, 0, 0, 0.7);">
                Refuser
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #fallback>
      <div class="max-w-md mx-auto p-6 my-8 text-center" style="color: var(--white); opacity: 0.8;">
        Chargement des conversations...
      </div>
    </template>
  </Suspense>
</template>

<style scoped>
/* Transition fluide */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* Style hover pour les conversations */
.hover\:bg-highlight-tempered:hover {
  background-color: var(--highlight-tempered) !important;
}
/* Style hover pour les boutons d'action */
a:hover {
  background-color: var(--higtlight) !important;
  color: var(--background) !important;
}
input::placeholder {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}
</style>
