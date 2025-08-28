<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Profile from '@/composables/useProfile'
import Conversation from '@/composables/useConversations'
import { toast } from 'vue3-toastify'
import { nextTick } from 'vue'

const router = useRouter()
const searchQuery = ref('')
const searchMethod = ref('contains')
const searchResults = ref([])
const isSearching = ref(false)
const currentUser = localStorage.getItem('pseudo')
const minSearchLength = 1
const searchInput = ref(null)
const showConfirmation = ref(false)
const selectedUser = ref(null)

// Fonction pour retourner en arrière
function goBack() {
  router.push('/');
}

// Fonction de recherche optimisée
async function performSearch(force = false) {
  const query = searchQuery.value.trim()
  if (query.length < minSearchLength && !force) {
    searchResults.value = []
    return
  }
  isSearching.value = true
  try {
    const results = await Profile.searchUsers(query, searchMethod.value)
    searchResults.value = results.filter(user => user.pseudo != currentUser)
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    toast.error(`Erreur lors de la recherche`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  } finally {
    isSearching.value = false
  }
}

// Recherche à chaque changement de requête
watch(searchQuery, (newValue) => {
  if (newValue.trim().length >= minSearchLength) {
    performSearch()
  } else {
    searchResults.value = []
  }
})

// Recherche aussi quand le mode change
watch(searchMethod, () => {
  if (searchQuery.value.trim().length >= minSearchLength) {
    performSearch(true)
  }
})

const methods = [
  { value: 'exact', label: 'Correspondance exacte' },
  { value: 'startsWith', label: 'Commence par' },
  { value: 'endsWith', label: 'Finit par' },
  { value: 'contains', label: 'Contient' },
  { value: 'pattern', label: 'Motif (avec *)' },
]

function openConfirmation(user) {
  selectedUser.value = user
  showConfirmation.value = true
}

function closeConfirmation() {
  showConfirmation.value = false
  selectedUser.value = null
}

async function confirmInvitation() {
  if (!selectedUser.value) return

  try {
    let response = await Conversation.sendInvitation(selectedUser.value.pseudo, selectedUser.value.public_key)
    if (response) {
      toast.success(`Invitation envoyée à ${selectedUser.value.pseudo} !`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } else {
      toast.error(`L'invitation existe déjà ou ne peut être créée`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
    closeConfirmation()
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'invitation:', error)
    toast.error(`Échec de l'envoi de l'invitation`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }
}

function handleSubmit(e) {
  e.preventDefault()
  if (searchQuery.value.trim().length >= minSearchLength) {
    performSearch(true)
  }
}

function focusInput() {
  nextTick(() => {
    searchInput.value?.focus()
  })
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 my-8"
    style="background-color: var(--background); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- En-tête avec bouton retour et titre centré -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl md:text-4xl font-bold tracking-widest"
        style="font-family: 'Bebas Neue', sans-serif; text-transform: uppercase; letter-spacing: 2px; color: var(--white);">
        Recherche de profils
      </h1>
      <router-link to="/" class="p-2 rounded-lg transition-colors"
        style="background-color: var(--highlight-tempered); color: var(--white);">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </router-link>
    </div>

    <!-- Formulaire de recherche -->
    <form @submit.prevent="handleSubmit">
      <div class="mb-6">
        <div class="relative">
          <input ref="searchInput" v-model="searchQuery" type="text"
            :placeholder="`Entrez un pseudo (min ${minSearchLength} caractères)...`"
            class="w-full p-3 pl-10 rounded-lg border border-higtlight focus:outline-none focus:ring-2"
            style="background-color: var(--highlight-tempered); color: var(--white); border-color: var(--higtlight);">
          <div class="absolute left-0 top-0 h-full flex items-center pl-3" style="pointer-events: none;">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" style="color: var(--higtlight);" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Filtres -->
        <div class="mt-4">
          <label class="block text-sm font-medium mb-2" style="color: var(--white); opacity: 0.9;">
            Méthode de recherche
          </label>
          <select v-model="searchMethod"
            class="w-full p-2 rounded-lg border border-higtlight focus:outline-none focus:ring-2"
            style="background-color: var(--highlight-tempered); color: var(--white); border-color: var(--higtlight);">
            <option v-for="method in methods" :key="method.value" :value="method.value">
              {{ method.label }}
            </option>
          </select>
        </div>

        <!-- Bouton de recherche -->
        <button type="submit" class="w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors"
          :disabled="isSearching || searchQuery.trim().length < minSearchLength"
          style="background-color: var(--higtlight); color: var(--background);">
          <span v-if="!isSearching">Rechercher</span>
          <span v-else>Recherche en cours...</span>
        </button>
      </div>
    </form>

    <!-- Résultats -->
    <div class="mt-4">
      <div v-if="isSearching" class="text-center py-4" style="color: var(--white); opacity: 0.7;">
        Recherche en cours...
      </div>

      <div v-else>
        <div v-if="searchResults.length > 0">
          <ul class="rounded-lg overflow-hidden" style="border: 1px solid var(--higtlight);">
            <li v-for="user in searchResults" :key="user.user_id" class="hover:bg-highlight-tempered transition-colors"
              style="border-bottom: 1px solid var(--highlight-tempered);" @click="focusInput">
              <div class="p-3 flex justify-between items-center">
                <span class="text-lg font-medium" style="color: var(--white);">
                  {{ user.pseudo }}
                </span>
                <div class="flex space-x-2">
                  <button @click.stop="openConfirmation(user)" class="text-xs py-1 px-2 rounded-lg"
                    style="background-color: var(--higtlight); color: var(--background);">
                    Inviter
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div v-else-if="searchQuery.trim().length >= minSearchLength && !isSearching" class="p-4 text-center text-sm"
          style="color: var(--white); opacity: 0.7;" @click="focusInput">
          Aucun utilisateur trouvé
        </div>

        <div v-else class="p-4 text-center text-sm" style="color: var(--white); opacity: 0.7;" @click="focusInput">
          Entrez au moins {{ minSearchLength }} caractères pour rechercher
        </div>
      </div>
    </div>

    <!-- Popup de confirmation -->
    <div v-if="showConfirmation"
      class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeConfirmation">
      <div class="bg-background rounded-lg p-6 max-w-sm w-full mx-4" style="border: 1px solid var(--higtlight);">
        <h2 class="text-2xl font-bold mb-4 text-center tracking-widest"
          style="color: var(--white); font-family: 'Bebas Neue', sans-serif;">
          Confirmer l'invitation
        </h2>

        <p class="text-center mb-6" style="color: var(--white);">
          Voulez-vous vraiment envoyer une invitation à <span class="font-bold">{{ selectedUser?.pseudo }}</span> ?
        </p>

        <div class="flex justify-center space-x-4">
          <button @click="closeConfirmation" class="px-4 py-2 rounded-lg text-white"
            style="background-color: var(--highlight-tempered);">
            Annuler
          </button>
          <button @click="confirmInvitation" class="px-4 py-2 rounded-lg text-background"
            style="background-color: var(--higtlight);">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover\:bg-highlight-tempered:hover {
  background-color: var(--highlight-tempered) !important;
}

a:hover {
  background-color: var(--higtlight) !important;
  color: var(--background) !important;
}
/* Style pour le placeholder */
input::placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Désactive le bouton quand nécessaire */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
