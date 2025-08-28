<script setup>
const props = defineProps({
    internet: Boolean,
    api: Boolean,
});
</script>

<template>
    <div v-if="!internet || !api" class="max-w-md mx-auto p-6 my-8"
        style="background-color: var(--background); border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h1 class="text-2xl font-bold mb-6 text-center" style="color: var(--white);">
            {{ !internet ? 'Pas de connexion Internet' : 'API inaccessible' }}
        </h1>
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
                        {{ !internet ? 'Connexion Internet requise' : 'Problème de connexion à l\'API' }}
                    </h2>
                    <p class="mb-3" style="color: var(--white); opacity: 0.9;">
                        {{ !internet ? 'Votre appareil n\'est pas connecté à Internet. Veuillez activer votre connexion Wi-Fi oudonnées mobiles.' :
                        'L\'API est inaccessible. Cela peut être dû à une maintenance ou un problème serveur. Veuillez contacter l\'administrateur.' }}
                    </p>
                    <p v-if="!internet" class="mb-3" style="color: var(--white); opacity: 0.9;">
                        <strong>Comment activer votre connexion ?</strong>
                    </p>
                    <ul class="pl-5 mb-3" style="color: var(--white); opacity: 0.9;">
                        <li>Vérifiez que le mode avion est désactivé.</li>
                        <li>Activez le Wi-Fi ou les données mobiles.</li>
                        <li>Redémarrez votre routeur si nécessaire.</li>
                    </ul>
                    <p v-if="!api" class="mb-3" style="color: var(--white); opacity: 0.9;">
                        <strong>Contactez l'administrateur :</strong>
                    </p>
                    <ul class="pl-5 mb-3" style="color: var(--white); opacity: 0.9;">
                        <li>
                            Site : <a href="https://armand-walle.com" target="_blank"
                                style="color: var(--higtlight); text-decoration: none; font-weight: 500;">
                                armand-walle.com
                            </a>
                        </li>
                        <li>Discord: ardou_</li>
                    </ul>

                    <p class="font-medium" style="color: var(--white);">
                        Cette application utilise un <span class="font-semibold"
                            style="color: var(--higtlight);">chiffrement de bout en bout</span>.
                        Vos messages sont chiffrés sur votre appareil et ne peuvent être lus que par vous et vos
                        correspondants.
                    </p>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="max-w-md mx-auto p-6 my-8 text-center" style="color: var(--white);">
        <p>Tout est opérationnel ! Vous pouvez utiliser l'application normalement.</p>
    </div>
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
