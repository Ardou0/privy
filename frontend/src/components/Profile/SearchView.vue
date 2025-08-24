<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Profile from '@/composables/useProfile'
import { toast } from 'vue3-toastify'
import { nextTick } from 'vue'

const router = useRouter()
const searchQuery = ref('')
const searchMethod = ref('contains')
const searchResults = ref([])
const isSearching = ref(false)
const currentUserId = localStorage.getItem('user_id')
const minSearchLength = 2
const searchInput = ref(null)

// Fonction pour retourner en arrière
function goBack() {
  router.go(-1)
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
    searchResults.value = results.filter(user => user.user_id != currentUserId)
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

function startConversation(userId) {
  router.push(`/conversations/new?user=${userId}`)
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
    <div class="relative mb-6">
      <button @click="goBack"
              class="goback absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
              style="background-color: var(--highlight-tempered); color: var(--white);"
              @mouseover="this.style.backgroundColor='var(--higtlight)'; this.style.color='var(--background)'"
              @mouseout="this.style.backgroundColor='var(--highlight-tempered)'; this.style.color='var(--white)'">
        <svg xmlns="http://www.w3.org/2000/svg"
             class="h-6 w-6"
             fill="none"
             viewBox="0 0 24 24"
             stroke="currentColor">
          <path stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <h1 class="text-3xl md:text-4xl font-bold text-center tracking-widest"
          style="font-family: 'Bebas Neue', sans-serif; text-transform: uppercase; letter-spacing: 2px; color: var(--white);">
        Rechercher des utilisateurs
      </h1>
    </div>

    <!-- Formulaire de recherche -->
    <form @submit.prevent="handleSubmit">
      <div class="mb-6">
        <div class="relative">
          <input ref="searchInput"
                 v-model="searchQuery"
                 type="text"
                 placeholder="Entrez un pseudo (min 2 caractères)..."
                 class="w-full p-3 pl-10 rounded-lg border border-higtlight focus:outline-none focus:ring-2"
                 style="background-color: var(--highlight-tempered); color: var(--white); border-color: var(--higtlight);">
          <div class="absolute left-0 top-0 h-full flex items-center pl-3"
               style="pointer-events: none;">
            <svg xmlns="http://www.w3.org/2000/svg"
                 class="h-5 w-5"
                 style="color: var(--higtlight);"
                 fill="none"
                 viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Filtres -->
        <div class="mt-4">
          <label class="block text-sm font-medium mb-2"
                 style="color: var(--white); opacity: 0.9;">
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
        <button type="submit"
                class="w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors"
                :disabled="isSearching || searchQuery.trim().length < minSearchLength"
                style="background-color: var(--higtlight); color: var(--background);">
          <span v-if="!isSearching">Rechercher</span>
          <span v-else>Recherche en cours...</span>
        </button>
      </div>
    </form>

    <!-- Résultats -->
    <div class="mt-4">
      <div v-if="isSearching" class="text-center py-4"
           style="color: var(--white); opacity: 0.7;">
        Recherche en cours...
      </div>

      <div v-else>
        <div v-if="searchResults.length > 0">
          <ul class="rounded-lg overflow-hidden"
              style="border: 1px solid var(--higtlight);">
            <li v-for="user in searchResults"
                :key="user.user_id"
                class="hover:bg-highlight-tempered transition-colors"
                style="border-bottom: 1px solid var(--highlight-tempered);"
                @click="focusInput">
              <div class="p-3 flex justify-between items-center">
                <span class="text-lg font-medium"
                      style="color: var(--white);">
                  {{ user.pseudo }}
                </span>
                <button @click.stop="startConversation(user.user_id)"
                        class="text-xs py-1 px-2 rounded-lg"
                        style="background-color: var(--higtlight); color: var(--background);">
                  Contacter
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div v-else-if="searchQuery.trim().length >= minSearchLength && !isSearching"
             class="p-4 text-center text-sm"
             style="color: var(--white); opacity: 0.7;"
             @click="focusInput">
          Aucun utilisateur trouvé
        </div>

        <div v-else class="p-4 text-center text-sm"
             style="color: var(--white); opacity: 0.7;"
             @click="focusInput">
          Entrez au moins {{ minSearchLength }} caractères pour rechercher
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover\:bg-highlight-tempered:hover {
  background-color: var(--highlight-tempered) !important;
}

.goback:hover {
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
