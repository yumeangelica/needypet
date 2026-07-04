import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { installAuthGuard } from '@/router/authGuard';
import router from '@/router/index';
import App from './App.vue';

/* App styles (Tailwind + custom theme) */
import './app.css';

import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';

async function initApp() {
  const pinia = createPinia();
  const app = createApp(App).use(pinia);

  const userStore = useUserStore();
  const petStore = usePetStore();

  // Initialize user's session from local storage if token exists
  if (!userStore.token) {
    await userStore.initializeFromLocalStorage();
  }

  // Validate token and set user's session accordingly
  const isValidToken = await userStore.checkAndValidateToken();

  installAuthGuard(router, userStore);

  if (isValidToken) {
    // If token is valid, fetch pets before the first protected view renders.
    await petStore.getAllPets();
  }

  app.use(router);
  await router.isReady();
  app.mount('#app');
}

initApp();
