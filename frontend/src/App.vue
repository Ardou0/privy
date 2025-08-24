<template>
  <div id="app">

    <router-view />

  </div>
</template>

<script setup>
import { toast } from 'vue3-toastify';

const notify = () => {
  toast("Wow so easy !", {
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    toastId: "custom-id-yes",
    position: toast.POSITION.BOTTOM_RIGHT,
  });
};

</script>