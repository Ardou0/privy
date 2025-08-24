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

const internetAccess = navigator.onLine;
const apiStatusCheck = await apiStatus.check();
if (!internetAccess || !apiStatusCheck) {
    console.error("No internet access. Please check your connection.");
    import ('./components/NoInternetView.vue').then(({ default: NoInternet }) => {
        const app = createApp(NoInternet, {
            internet: internetAccess,
            api: apiStatusCheck
        });
        app.mount('#app');
    });
}
else {
    const app = createApp(App)
    app.use(router)
    app.use(createPinia())
    app.use(Vue3Toasity)

    // mount after the initial navigation is ready
    await router.isReady()
    app.mount('#app')
}