import { createRouter, createWebHashHistory } from 'vue-router';
import useAuth from './composables/useAuth'
import { useRouter } from 'vue-router'

const HomeView = () => import('./components/HomeView.vue')
const LoginView = () => import('./components/Auth/LoginView.vue')
const RegisterView = () => import('./components/Auth/RegisterView.vue')
const ProfileView = () => import('./components/Profile/MeView.vue')
const ProfileSearchView = () => import('./components/Profile/SearchView.vue')
const ConversationView = () => import('./components/ConversationView.vue')
const ErrorView = () => import('./components/NoInternetView.vue')

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/profile/search', name: 'profile-search', component: ProfileSearchView },
  { path: '/conversations/:id', name: 'conversation', component: ConversationView, props: true },
  { path: '/error', name: "error", component: ErrorView }, 
  { path: '/:catchAll(.*)', redirect: '/' } // Catch-all route to redirect to home if no match is found
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Add navigation guard to prevent redirect loop
router.beforeEach(async (to, from, next) => {
  try {
    const isAuthenticated = await useAuth.checkAuth();

    if (!isAuthenticated) {
      // Si non authentifié et que la route n'est pas login/register, rediriger vers login
      if (to.name !== 'login' && to.name !== 'register') {
        next({ name: 'login' });
      } else {
        next(); // Sinon, laisser passer
      }
    } else {
      // Si authentifié et que la route est login/register, rediriger vers home
      if (to.name === 'login' || to.name === 'register') {
        next({ name: 'home' });
      } else {
        next(); // Sinon, laisser passer
      }
    }
  }
  catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification :', error);
    next(); // En cas d'erreur, laisser passer pour éviter de bloquer la navigation
  }
});


export default router