<template>
  <router-view v-if="routerReady" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const routerReady = ref(false);

onMounted(() => {
  router.isReady().then(() => {
    routerReady.value = true;
  });
});
</script>
<style>
.Toastify__toast {
  top: calc(var(--safe-area-inset-top, 0px));
  padding-top: calc(var(--ion-safe-area-top, 0px));
}
</style>