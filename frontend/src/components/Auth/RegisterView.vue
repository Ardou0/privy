<script setup>
import { ref } from 'vue';
import auth from '@/composables/useAuth';
import Encryption from '@/composables/useEncryption';
import { useRouter } from 'vue-router';
const router = useRouter();
const pseudo = ref('');
const password = ref('');
const hasReadTutorial = ref(false);
// Fonctions existantes (inchangées)

const downloadKeyPair = () => {
    const privateKey = localStorage.getItem('privateKey');
    const publicKey = localStorage.getItem('publicKey');
    const blob = new Blob([
        `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----\n` +
        `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cles_utilisateur.pem';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const handleRegister = async () => {
    try {
        if (!pseudo.value || !password.value) {
            alert("Pseudo et mot de passe sont requis.");
            return;
        }
        const pubKey = await Encryption.generateKeyPair();
        const response = await auth.register(pseudo.value, password.value, pubKey);
        if (response) {
            alert("Inscription réussie !");
            downloadKeyPair();
            router.push('/login');
        }
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        alert("Erreur lors de l'inscription.", error);
    }
};

</script>

<template>
    <div class="register-view max-w-md mx-auto p-6 my-8"
        style="background-color: var(--background); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h1 class="text-2xl font-bold mb-6 text-center" style="color: var(--white);">
            Inscription
        </h1>

        <!-- Tutoriel -->
        <div class="p-5 mb-6 rounded-lg"
            style="background-color: var(--highlight-tempered); border-left: 4px solid var(--higtlight);">
            <div class="flex items-start">
                <svg class="h-6 w-6 mr-3 flex-shrink-0" style="color: var(--higtlight);" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h2 class="text-lg font-semibold mb-2" style="color: var(--white);">
                        Important : Lisez avant de continuer
                    </h2>
                    <p class="mb-3" style="color: var(--white); opacity: 0.9;">
                        Cette application utilise un <span class="font-semibold"
                            style="color: var(--higtlight);">chiffrement de bout en bout</span>.
                        Vos messages sont chiffrés sur votre appareil et ne peuvent être lus que par vos correspondants.
                    </p>
                    <p class="mb-3" style="color: var(--white); opacity: 0.9;">
                        <span class="font-semibold" style="color: var(--higtlight);">Vos clés cryptographiques</span>
                        sont générées lors de l'inscription :
                    <ul class="pl-5 mb-3" style="color: var(--white); opacity: 0.9;">
                        <li><span class="font-medium">Clé publique</span> : partagée avec le serveur pour chiffrer vos
                            messages.</li>
                        <li><span class="font-medium">Clé privée</span> :
                            <span class="font-semibold" style="color: var(--higtlight);">
                                uniquement stockée sur votre appareil
                            </span>. Sans elle, vous perdrez l'accès à vos données en cas de changement d'appareil.
                        </li>
                    </ul>
                    </p>
                    <p class="font-medium" style="color: var(--white);">
                        Vous êtes <span class="font-semibold" style="color: var(--higtlight);">responsable de la
                            sauvegarde de vos clés</span>.
                        Téléchargez-les et conservez-les en lieu sûr.
                    </p>
                </div>
            </div>
        </div>

        <!-- Case à cocher obligatoire -->
        <div class="mb-5 flex items-center">
            <input type="checkbox" id="tutorial" v-model="hasReadTutorial" class="h-5 w-5 rounded focus:ring-2"
                style="accent-color: var(--higtlight); border-color: var(--higtlight);">
            <label for="tutorial" class="ml-3 block font-medium" style="color: var(--white);">
                J’ai lu et compris l’importance de sauvegardar mes clés.
            </label>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="handleRegister" class="space-y-5">
            <div>
                <label for="pseudo" class="block text-sm font-medium mb-1" style="color: var(--white); opacity: 0.9;">
                    Pseudo
                </label>
                <input type="text" id="pseudo" v-model="pseudo" required
                    class="block w-full px-3 py-2 rounded-md shadow-sm border-none focus:ring-2" style="background-color: var(--highlight-tempered); color: var(--white);
                           border: 1px solid var(--higtlight);">
            </div>
            <div>
                <label for="password" class="block text-sm font-medium mb-1" style="color: var(--white); opacity: 0.9;">
                    Mot de passe
                </label>
                <input type="password" id="password" v-model="password" required
                    class="block w-full px-3 py-2 rounded-md shadow-sm border-none focus:ring-2" style="background-color: var(--highlight-tempered); color: var(--white);
                           border: 1px solid var(--higtlight);">
            </div>
            <button type="submit" :disabled="!hasReadTutorial" class="w-full py-2 px-4 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2
                       disabled:opacity-50 disabled:cursor-not-allowed" style="background-color: var(--higtlight); color: var(--background);
                       border: 1px solid var(--higtlight);">
                S’inscrire
            </button>
        </form>

        <!-- Lien vers la page de connexion -->
        <div class="mt-5 text-center">
            <p class="text-sm" style="color: var(--white); opacity: 0.8;">
                Déjà un compte ?
                <router-link to="/login" class="font-medium hover:opacity-90 transition-opacity"
                    style="color: var(--higtlight);">
                    Se connecter
                </router-link>
            </p>
        </div>
    </div>
</template>
