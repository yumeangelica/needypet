import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router/index';
import { createPinia } from 'pinia';

/* App styles (Tailwind + custom theme) */
import './app.css';

// Import the store
import { useUserStore } from '@/store/user';
import { usePetStore } from '@/store/pet';

async function initApp() {
  const app = createApp(App).use(router).use(createPinia());

  const userStore = useUserStore();
  const petStore = usePetStore();

  // Define public routes
  const publicRoutes = ['login', 'register', 'landing', 'confirm', 'request-password-reset'];

  // Initialize user's session from local storage if token exists
  if (!userStore.token) {
    await userStore.initializeFromLocalStorage();
  }

  // Validate token and set user's session accordingly
  const isValidToken = await userStore.checkAndValidateToken();

  router.beforeEach((to, from, next) => {
    if (publicRoutes.includes(to.name as string)) {
      next();
    } else if (userStore.token) {
      next();
    } else {
      next({ name: 'landing' });
    }
  });

  if (isValidToken) {
    // If token is valid, fetch pets and navigate to the intended route
    await petStore.getAllPets();
    const currentPath = sessionStorage.getItem('currentPath') || '/';

    // Navigate to saved path if it's not a public route or the home page by default
    if (!publicRoutes.includes(router.currentRoute.value.name as string) && currentPath !== '/') {
      router.push(currentPath);
    }
  }

  router.isReady().then(() => {
    app.mount('#app');
  });
}

initApp();

