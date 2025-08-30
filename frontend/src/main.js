import './assets/main.css'
import axios from 'axios'
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Vue3Toasity from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { apiStatus } from './apiStatus'

const apiStatusCheck = await apiStatus.check();
if (!apiStatusCheck) {
    console.error("No internet access. Please check your connection.");
    import('./components/NoInternetView.vue').then(({ default: NoInternet }) => {
        const app = createApp(NoInternet, {
            internet: internetAccess,
            api: apiStatusCheck
        });
        app.mount('#app');
    });
}
else {
    const app = createApp(App);
    app.use(router);
    app.use(createPinia());
    app.use(Vue3Toasity)
    
    app.mount('#app');
}

import { SafeArea } from 'capacitor-plugin-safe-area';

SafeArea.getSafeAreaInsets().then((data) => {
  const { insets } = data;
  document.body.style.setProperty('--ion-safe-area-top', `${insets.top}px`);
  document.body.style.setProperty('--ion-safe-area-right', `${insets.right}px`);
  document.body.style.setProperty('--ion-safe-area-bottom', `${insets.bottom}px`);
  document.body.style.setProperty('--ion-safe-area-left', `${insets.left}px`);
});
