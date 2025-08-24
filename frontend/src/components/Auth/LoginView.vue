<script setup>
import auth from '@/composables/useAuth'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router';
import { ref } from 'vue'
const text = ref('')
const password = ref('')
const handleLogin = async () => {
    try {
        let result = await auth.login({ nickname: text.value, password: password.value })
        console.log(result)
        const router = useRouter();
        window.location.href = '/';
        toast.success("Connexion réussie !", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    } catch (error) {
        console.error('Échec de la connexion:', error)
        if (error.response && error.response.data && error.response.data.error) {
            toast.error(`Échec de la connexion : ${(error.response.data.error).trim()}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }
        else {
            toast.error("Échec de la connexion. Veuillez réessayer.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }
}
</script>

<template>
    <div class="login-view max-w-md mx-auto p-6 my-8"
        style="background-color: var(--background); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h1 class="text-2xl font-bold mb-6 text-center" style="color: var(--white);">
            Connexion
        </h1>

        <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
                <label for="nickname" class="block text-sm font-medium mb-1" style="color: var(--white); opacity: 0.9;">
                    Pseudo
                </label>
                <input type="text" id="nickname" v-model="text" required autocomplete="username"
                    class="block w-full px-3 py-2 rounded-md shadow-sm border-none focus:ring-2" style="background-color: var(--highlight-tempered); color: var(--white);
                           border: 1px solid var(--higtlight);">
            </div>
            <div>
                <label for="password" class="block text-sm font-medium mb-1" style="color: var(--white); opacity: 0.9;">
                    Mot de passe
                </label>
                <input type="password" id="password" v-model="password" required autocomplete="current-password"
                    class="block w-full px-3 py-2 rounded-md shadow-sm border-none focus:ring-2" style="background-color: var(--highlight-tempered); color: var(--white);
                           border: 1px solid var(--higtlight);">
            </div>
            <button type="submit" class="w-full py-2 px-4 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2
                       hover:opacity-90 transition-opacity" style="background-color: var(--higtlight); color: var(--background);
                       border: 1px solid var(--higtlight);">
                Se connecter
            </button>
        </form>

        <div class="mt-5 text-center">
            <p class="text-sm" style="color: var(--white); opacity: 0.8;">
                Pas encore de compte ?
                <router-link to="/register" class="font-medium hover:opacity-90 transition-opacity"
                    style="color: var(--higtlight);">
                    S’enregistrer
                </router-link>
            </p>
        </div>
    </div>
</template>
