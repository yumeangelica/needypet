import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router/index';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Custom styles */
import './theme/styles.css';

// Import the store
import { useUserStore } from '@/store/user';
import { usePetStore } from './store/pet';

async function initApp() {
  const app = createApp(App).use(IonicVue).use(router).use(createPinia());

  const userStore = useUserStore();
  const petStore = usePetStore();

  await router.isReady();

  // Define public routes
  const publicRoutes = ['login', 'register'];

  // Initialize user's session from local storage if token exists
  if (!userStore.token) {
    await userStore.initializeFromLocalStorage();
  }

  // Validate token and set user's session accordingly
  const isValidToken = await userStore.checkAndValidateToken();

  if (isValidToken) {
    // If token is valid, fetch pets and navigate to the intended route
    await petStore.getAllPets();
    const currentPath = sessionStorage.getItem('currentPath') || '/';

    // Navigate to saved path if it's not a public route or the home page by default
    if (
      !publicRoutes.includes(router.currentRoute.value.name as string) ||
      currentPath !== '/'
    ) {
      router.push(currentPath);
    }
  } else {
    // If token is not valid, navigate to login page unless it's a public route
    if (!publicRoutes.includes(router.currentRoute.value.name as string)) {
      router.push({ name: 'login' });
    }
  }

  app.mount('#app');
}

initApp();
