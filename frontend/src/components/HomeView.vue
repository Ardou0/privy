<script setup>
import { ref } from 'vue'
import Conversation from '@/composables/useConversations'
const conversations = ref([])
const invitations = ref([])
const activeTab = ref('conversations')

async function fetchConversations() {
  conversations.value = await Conversation.getConversations();
}
async function fetchInvitations() {
  let data = await Conversation.getInvitations();
  if(data.length === 0) {
    invitations.value = [];
    return;
  } else {
    invitations.value = data;
  }
}
fetchConversations();
fetchInvitations();

function getOtherPseudo(conv) {
  return localStorage.getItem("user_id") == conv.creator_id
    ? conv.participant_pseudo
    : conv.creator_pseudo;
}
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
            <router-link to="/profile/search"
                         class="p-2 rounded-lg transition-colors"
                         style="background-color: var(--highlight-tempered); color: var(--white);">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </router-link>
            <router-link to="/profile"
                         class="p-2 rounded-lg transition-colors"
                         style="background-color: var(--highlight-tempered); color: var(--white);">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </router-link>
          </div>
        </div>

        <!-- Onglets -->
        <div class="flex w-full rounded-lg overflow-hidden mb-4">
          <button @click="activeTab = 'conversations'"
                  class="flex-1 py-2 text-sm font-medium focus:outline-none transition-colors"
                  :style="activeTab === 'conversations' ?
                    { 'background-color': 'var(--higtlight)', color: 'var(--background)' } :
                    { 'background-color': 'var(--highlight-tempered)', color: 'var(--white)' }">
            Conversations
          </button>
          <button @click="activeTab = 'invitations'"
                  class="flex-1 py-2 text-sm font-medium focus:outline-none transition-colors"
                  :style="activeTab === 'invitations' ?
                    { 'background-color': 'var(--higtlight)', color: 'var(--background)' } :
                    { 'background-color': 'var(--highlight-tempered)', color: 'var(--white)' }">
            Invitations
          </button>
        </div>

        <!-- Contenu -->
        <div class="mt-2">
          <transition name="fade" mode="out-in">
            <div v-if="activeTab === 'conversations'" key="conversations">
              <ul class="rounded-lg overflow-hidden"
                  style="border: 1px solid var(--higtlight);">
                <li v-for="conv in conversations" :key="conv.id"
                    class="transition-colors hover:bg-highlight-tempered"
                    style="border-bottom: 1px solid var(--highlight-tempered);">
                  <router-link :to="`/conversations/${conv.conversation_id}`"
                               class="block p-3 text-lg font-medium"
                               style="color: var(--white);">
                    {{ getOtherPseudo(conv) }}
                  </router-link>
                </li>
                <div v-if="conversations.length === 0"
                     class="p-4 text-center text-sm"
                     style="color: var(--white); opacity: 0.7;">
                  Aucune conversation trouvée.
                </div>
              </ul>
            </div>
            <div v-else key="invitations">
              <ul class="space-y-2">
                <li v-for="invite in invitations" :key="invite.id"
                    class="p-3 rounded-lg hover:bg-opacity-20 transition-colors"
                    style="background-color: var(--highlight-tempered);">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-medium" style="color: var(--white);">
                      {{ invite.creator_pseudo }}
                    </span>
                    <button class="text-xs py-1 px-2 rounded"
                            style="background-color: var(--higtlight); color: var(--background);">
                      Accepter
                    </button>
                  </div>
                </li>
                <div v-if="invitations.length === 0"
                     class="p-4 text-center text-sm"
                     style="color: var(--white); opacity: 0.7;">
                  Aucune invitation en attente.
                </div>
              </ul>
            </div>
          </transition>
        </div>
      </div>
    </template>
    <template #fallback>
      <div class="max-w-md mx-auto p-6 my-8 text-center"
           style="color: var(--white); opacity: 0.8;">
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
</style>
