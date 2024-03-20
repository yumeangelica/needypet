import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router/index';

import { IonicVue } from '@ionic/vue';

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

import { createPinia } from 'pinia';
import { useUserStore } from '@/store/user';
import { usePetStore } from './store/pet';

async function initApp() {
  const app = createApp(App).use(IonicVue).use(router).use(createPinia());

  const userStore = useUserStore();
  const petStore = usePetStore();

  await router.isReady();

  // if the token is not in the store, try to get it from the local storage
  if (!userStore.token) {
    await userStore.initializeFromLocalStorage();
  }

  const isValidToken = await userStore.checkAndValidateToken();
  if (isValidToken) {
    await petStore.getAllPets();

    const currentPath = sessionStorage.getItem('currentPath');
    if (currentPath && currentPath !== '/') {
      router.push(currentPath);
    } else {
      router.push({ name: 'home' });
    }
  } else {
    router.push({ name: 'login' });
  }

  app.mount('#app');
}

initApp();
