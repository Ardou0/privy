<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import Auth from '../../composables/useAuth'
import Profile from '../../composables/useProfile'

const router = useRouter()
const user = ref({
    pseudo: localStorage.getItem('user_pseudo') || 'Utilisateur',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
})
const showChangePasswordPopup = ref(false)
const showImportKeyPopup = ref(false)
const pseudo = ref(localStorage.getItem("pseudo"))
const showImportConvKeysPopup = ref(false)
const showDeleteAccountPopup = ref(false)
const showLogoutPopup = ref(false)
const fileInputKey = ref(null)
const fileInputConvKeys = ref(null)
const deletePassword = ref('')

// Fonction pour mettre à jour le mot de passe
async function updatePassword() {
    if (user.value.newPassword !== user.value.confirmNewPassword) {
        toast.error("Les nouveaux mots de passe ne correspondent pas.", { position: "top-right", autoClose: 3000 })
        return
    }
    try {
        if (await Profile.updatePassword(user.value.currentPassword, user.value.newPassword)) {
            user.value.currentPassword = ''
            user.value.newPassword = ''
            user.value.confirmNewPassword = ''
            toast.success("Mot de passe mis à jour avec succès !", { position: "top-right", autoClose: 3000 })
        } else {
            toast.error("Une erreur est survenue.", { position: "top-right", autoClose: 3000 })
        }
    } catch (error) {
        toast.error("Erreur lors de la mise à jour du mot de passe.", { position: "top-right", autoClose: 3000 })
    }
    closeChangePasswordPopup()
}

// Fonction pour télécharger les clés de conversation en PEM
async function downloadConvKeys() {
    try {
        await Profile.downloadConversationsKeys()
        toast.success("Clés de conversation téléchargées.", { position: "top-right", autoClose: 3000 })
    } catch (error) {
        toast.error(error.message || "Aucune clé de conversation enregistrée.", { position: "top-right", autoClose: 3000 })
    }
}

// Fonction pour importer une paire de clés PEM
async function handleKeyPairImport(event) {
    const file = event.target.files[0]
    if (!file) return
    try {
        await Profile.loadPairedKeys(file)
        toast.success("Paire de clés importée avec succès !", { position: "top-right", autoClose: 3000 })
    } catch (error) {
        toast.error(error.message || "Échec de l'import.", { position: "top-right", autoClose: 3000 })
    } finally {
        closeImportKeyPopup()
    }
}

// Fonction pour importer des clés de conversation en PEM
async function handleConvKeysImport(event) {
    const file = event.target.files[0]
    if (!file) return
    try {
        await Profile.loadConversationsKeys(file)
        toast.success("Clés de conversation importées avec succès !", { position: "top-right", autoClose: 3000 })
    } catch (error) {
        toast.error(error.message || "Échec de l'import.", { position: "top-right", autoClose: 3000 })
    } finally {
        closeImportConvKeysPopup()
    }
}

// Fonction pour changer la visibilité du compte
async function toggleVisibility() {
    try {
        const success = await Profile.toggleHide()
        if (success) {
            console.log(success)
            let status = success.result ? "Caché" : "Visible";
            toast.success(`Visibilité du compte modifiée avec succès. Vous êtes ${status}.`, { position: "top-right", autoClose: 3000 })
        } else {
            toast.error("Échec de la modification de la visibilité.", { position: "top-right", autoClose: 3000 })
        }
    } catch (error) {
        toast.error("Erreur lors de la modification de la visibilité.", { position: "top-right", autoClose: 3000 })
    }
}

// Fonction pour supprimer le compte
async function deleteAccount() {
    if (deletePassword.value !== "SUPPRIMER") {
        toast.error("Veuillez écrire exactement 'SUPPRIMER'.", { position: "top-right", autoClose: 3000 })
        return
    }
    try {
        const success = await Profile.deactivateAccount()
        if (success) {
            toast.success("Compte supprimé avec succès.", { position: "top-right", autoClose: 3000 })
            localStorage.clear()
            router.push('/login')
        } else {
            toast.error("Échec de la suppression du compte.", { position: "top-right", autoClose: 3000 })
        }
    } catch (error) {
        toast.error("Erreur lors de la suppression.", { position: "top-right", autoClose: 3000 })
    }
    closeDeleteAccountPopup()
}

async function logout() {
    try {
        await Auth.logout();
    } catch (error) {
        toast.error("Erreur lors de la déconnexion.", { position: "top-right", autoClose: 3000 })
    }
    closeLogoutPopup()
}

// Fonction pour déclencher l'import de paire de clés
function triggerKeyPairImport() {
    fileInputKey.value.click()
}

// Fonction pour déclencher l'import de clés de conversation
function triggerConvKeysImport() {
    fileInputConvKeys.value.click()
}

// Popups
function openChangePasswordPopup() {
    user.value.currentPassword = ''
    user.value.newPassword = ''
    user.value.confirmNewPassword = ''
    showChangePasswordPopup.value = true
}

function closeChangePasswordPopup() {
    showChangePasswordPopup.value = false
}

function openImportKeyPopup() {
    showImportKeyPopup.value = true
}

function closeImportKeyPopup() {
    showImportKeyPopup.value = false
}

function openImportConvKeysPopup() {
    showImportConvKeysPopup.value = true
}

function closeImportConvKeysPopup() {
    showImportConvKeysPopup.value = false
}

function openDeleteAccountPopup() {
    deletePassword.value = ''
    showDeleteAccountPopup.value = true
}

function closeDeleteAccountPopup() {
    showDeleteAccountPopup.value = false
}

function openLogoutPopup() {
    showLogoutPopup.value = true
}

function closeLogoutPopup() {
    showLogoutPopup.value = false
}

</script>

<template>
    <div class="max-w-md mx-auto p-6 my-8"
        style="background-color: var(--background); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl md:text-4xl font-bold tracking-widest"
                style="font-family: 'Bebas Neue', sans-serif; text-transform: uppercase; letter-spacing: 2px; color: var(--white);">
                Mon Profil
            </h1>
            <router-link to="/" class="p-2 rounded-lg transition-colors"
                style="background-color: var(--highlight-tempered); color: var(--white);">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </router-link>
        </div>

        <!-- Section Pseudo -->
        <div class="mb-6 p-4 rounded-lg" style="background-color: var(--higtlight); color: #000000;">
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-black" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="text-lg font-medium" style="color: #000000;">{{ pseudo }}</span>
            </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
            <!-- Changer mot de passe -->
            <button @click="openChangePasswordPopup"
                class="w-full p-3 rounded-lg text-left flex items-center justify-between transition-colors hover:bg-opacity-80"
                style="background-color: var(--highlight-tempered); color: var(--white);">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M 12 15 v 2 l 0 0 l 0 -2 m -3 -3 l 2 -2 l -2 -2 M 6 18 V 6 a 2 2 0 0 1 2 -2 h 8 a 2 2 0 0 1 2 2 v 12 a 2 2 0 0 1 -2 2 H 8 a 2 2 0 0 1 -2 -2 z" />
                    </svg>
                    <span>Changer de mot de passe</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <!-- Télécharger clés de conversation -->
            <button @click="downloadConvKeys"
                class="w-full p-3 rounded-lg text-left flex items-center justify-between transition-colors hover:bg-opacity-80"
                style="background-color: var(--highlight-tempered); color: var(--white);">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Télécharger mes clés de conversation</span>
                </div>
            </button>

            <!-- Importer paire de clés -->
            <button @click="openImportKeyPopup"
                class="w-full p-3 rounded-lg text-left flex items-center justify-between transition-colors hover:bg-opacity-80"
                style="background-color: var(--highlight-tempered); color: var(--white);">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Importer une paire de clés</span>
                </div>
            </button>

            <!-- Importer clés de conversation -->
            <button @click="openImportConvKeysPopup"
                class="w-full p-3 rounded-lg text-left flex items-center justify-between transition-colors hover:bg-opacity-80"
                style="background-color: var(--highlight-tempered); color: var(--white);">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M 9 18 a 4 4 0 0 1 -2 -8 A 5 5 0 1 1 15.9 6 L 16 6 a 5 5 0 0 1 7 5 a 5 5 0 0 1 -1.263 3.237 A 4 4 0 0 0 16 10 H 8 a 4 4 0 0 0 -1 5 z" />
                    </svg>
                    <span>Importer mes clés de conversation</span>
                </div>
            </button>

            <button @click="toggleVisibility"
                class="w-full p-3 rounded-lg text-left flex items-center justify-between transition-colors hover:bg-opacity-80"
                style="background-color: var(--highlight-tempered); color: var(--white);">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Changer la visibilité du compte</span>
                </div>
            </button>
        </div>

        <!-- Séparateur -->
        <div class="my-4 border-t" style="border-color: var(--higtlight); opacity: 0.3;"></div>

        <!-- Se déconnecter -->
        <div class="pt-2">
            <button @click="openLogoutPopup"
                class="w-full p-3 rounded-lg text-left flex items-center justify-between transition-colors hover:bg-opacity-80 mb-3"
                style="background-color: var(--highlight-tempered); color: var(--white); border: 1px solid var(--higtlight);">
                <div class="flex items-center">
                    <svg xmlns="http://www.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Se déconnecter</span>
                </div>
            </button>
        </div>

        <!-- Supprimer mon compte (en rouge) -->
        <div class="pt-2">
            <button @click="openDeleteAccountPopup"
                class="w-full p-3 rounded-lg text-left flex items-center justify-between transition-colors hover:bg-opacity-80"
                style="background-color: rgba(255, 0, 0, 0.2); color: var(--white); border: 1px solid rgba(255, 0, 0, 0.5);">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path xmlns="http://www.w3.org/2000/svg"
                            d="M10 12L14 16M14 12L10 16M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Supprimer mon compte</span>
                </div>
            </button>
        </div>

        <!-- Popup Se Déconnecter -->
        <div v-if="showLogoutPopup"
            class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="closeLogoutPopup">
            <div class="bg-background rounded-lg p-6 max-w-sm w-full mx-4" style="border: 1px solid rgba(255, 165, 0, 0.5);">
                <h2 class="text-xl font-bold mb-4 text-center"
                    style="color: var(--white); font-family: 'Bebas Neue', sans-serif;">
                    Se déconnecter
                </h2>
                <p class="text-center mb-4" style="color: var(--white); opacity: 0.9;">
                    Attention : il est impératif d'avoir sauvegardé toutes vos clés de conversation et votre paire de clés.
                    Une fois déconnecté, vos clés locales seront supprimées et il faudra les importer à nouveau pour les réutiliser.
                </p>
                <p class="text-center mb-4" style="color: var(--white); opacity: 0.9;">
                    Souhaitez-vous vraiment vous déconnecter ?
                </p>
                <div class="flex justify-center space-x-4">
                    <button @click="closeLogoutPopup" class="px-4 py-2 rounded-lg text-white"
                        style="background-color: var(--highlight-tempered);">
                        Annuler
                    </button>
                    <button @click="logout" class="px-4 py-2 rounded-lg text-white"
                        style="background-color: rgba(255, 165, 0, 0.7);">
                        Se déconnecter
                    </button>
                </div>
            </div>
        </div>

        <!-- Popup Changer Mot de Passe -->
        <div v-if="showChangePasswordPopup"
            class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="closeChangePasswordPopup">
            <div class="bg-background rounded-lg p-6 max-w-sm w-full mx-4" style="border: 1px solid var(--higtlight);">
                <h2 class="text-xl font-bold mb-4 text-center"
                    style="color: var(--white); font-family: 'Bebas Neue', sans-serif;">
                    Changer de mot de passe
                </h2>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm mb-1" style="color: var(--white); opacity: 0.9;">Mot de passe
                            actuel</label>
                        <input v-model="user.currentPassword" type="password"
                            class="w-full p-2 rounded-lg text-sm focus:outline-none"
                            style="background-color: var(--highlight-tempered); color: var(--white); border: 1px solid var(--higtlight);">
                    </div>
                    <div>
                        <label class="block text-sm mb-1" style="color: var(--white); opacity: 0.9;">Nouveau mot de
                            passe</label>
                        <input v-model="user.newPassword" type="password"
                            class="w-full p-2 rounded-lg text-sm focus:outline-none"
                            style="background-color: var(--highlight-tempered); color: var(--white); border: 1px solid var(--higtlight);">
                    </div>
                    <div>
                        <label class="block text-sm mb-1" style="color: var(--white); opacity: 0.9;">Confirmer nouveau
                            mot de passe</label>
                        <input v-model="user.confirmNewPassword" type="password"
                            class="w-full p-2 rounded-lg text-sm focus:outline-none"
                            style="background-color: var(--highlight-tempered); color: var(--white); border: 1px solid var(--higtlight);">
                    </div>
                </div>
                <div class="flex justify-center space-x-4 mt-6">
                    <button @click="closeChangePasswordPopup" class="px-4 py-2 rounded-lg text-white"
                        style="background-color: var(--highlight-tempered);">
                        Annuler
                    </button>
                    <button @click="updatePassword" class="px-4 py-2 rounded-lg text-background"
                        style="background-color: var(--higtlight);">
                        Valider
                    </button>
                </div>
            </div>
        </div>

        <!-- Popup Importer Paire de Clés -->
        <div v-if="showImportKeyPopup"
            class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="closeImportKeyPopup">
            <div class="bg-background rounded-lg p-6 max-w-sm w-full mx-4" style="border: 1px solid var(--higtlight);">
                <h2 class="text-xl font-bold mb-4 text-center"
                    style="color: var(--white); font-family: 'Bebas Neue', sans-serif;">
                    Importer une paire de clés
                </h2>
                <p class="text-center mb-4" style="color: var(--white); opacity: 0.9;">
                    Sélectionnez un fichier .pem
                </p>
                <input ref="fileInputKey" type="file" accept=".pem" @change="handleKeyPairImport" class="hidden">
                <button @click="triggerKeyPairImport" class="w-full p-2 rounded-lg text-white mb-4"
                    style="background-color: var(--higtlight);">
                    Sélectionner un fichier
                </button>
                <div class="flex justify-center space-x-4">
                    <button @click="closeImportKeyPopup" class="px-4 py-2 rounded-lg text-white"
                        style="background-color: var(--highlight-tempered);">
                        Annuler
                    </button>
                </div>
            </div>
        </div>

        <!-- Popup Importer Clés de Conversation -->
        <div v-if="showImportConvKeysPopup"
            class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="closeImportConvKeysPopup">
            <div class="bg-background rounded-lg p-6 max-w-sm w-full mx-4" style="border: 1px solid var(--higtlight);">
                <h2 class="text-xl font-bold mb-4 text-center"
                    style="color: var(--white); font-family: 'Bebas Neue', sans-serif;">
                    Importer mes clés de conversation
                </h2>
                <p class="text-center mb-4" style="color: var(--white); opacity: 0.9;">
                    Sélectionnez un fichier .pem
                </p>
                <input ref="fileInputConvKeys" type="file" accept=".pem" @change="handleConvKeysImport" class="hidden">
                <button @click="triggerConvKeysImport" class="w-full p-2 rounded-lg text-white mb-4"
                    style="background-color: var(--higtlight);">
                    Sélectionner un fichier
                </button>
                <div class="flex justify-center space-x-4">
                    <button @click="closeImportConvKeysPopup" class="px-4 py-2 rounded-lg text-white"
                        style="background-color: var(--highlight-tempered);">
                        Annuler
                    </button>
                </div>
            </div>
        </div>

        <!-- Popup Supprimer Compte -->
        <div v-if="showDeleteAccountPopup"
            class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="closeDeleteAccountPopup">
            <div class="bg-background rounded-lg p-6 max-w-sm w-full mx-4"
                style="border: 1px solid rgba(255, 0, 0, 0.5);">
                <h2 class="text-xl font-bold mb-4 text-center"
                    style="color: var(--white); font-family: 'Bebas Neue', sans-serif;">
                    Supprimer mon compte
                </h2>
                <p class="text-center mb-4" style="color: var(--white); opacity: 0.9;">
                    Cette action est irréversible. Tous vos données seront supprimées définitivement.
                </p>
                <div class="mb-4">
                    <label class="block text-center text-sm mb-1" style="color: var(--white); opacity: 0.9;">
                        Confirmez en écrivant "SUPPRIMER"
                    </label>
                    <input v-model="deletePassword" type="text" placeholder="SUPPRIMER"
                        class="w-full p-2 rounded-lg text-sm focus:outline-none"
                        style="background-color: var(--highlight-tempered); color: var(--white); border: 1px solid rgba(255, 0, 0, 0.5);" />
                </div>
                <div class="flex justify-center space-x-4">
                    <button @click="closeDeleteAccountPopup" class="px-4 py-2 rounded-lg text-white"
                        style="background-color: var(--highlight-tempered);">
                        Annuler
                    </button>
                    <button @click="deleteAccount" class="px-4 py-2 rounded-lg text-white"
                        style="background-color: rgba(255, 0, 0, 0.7);">
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Style hover pour les boutons */
button:hover {
    background-color: var(--higtlight) !important;
    color: var(--background) !important;
}

button[style*="rgba(255, 0, 0"]:hover {
    background-color: rgba(255, 0, 0, 0.4) !important;
    color: var(--background) !important;
}

input::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
}

a:hover {
    background-color: var(--higtlight) !important;
    color: var(--background) !important;
}
</style>
