<template>
  <ion-header v-if="!isMobile && !isLoginPage && !isRegisterPage">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button fill="clear" @click="navigateHome"><ion-icon :icon="pawOutline" aria-hidden="true"></ion-icon>Home</ion-button>
      </ion-buttons>
      <div slot="end" style="display: flex; align-items: center;">

        <ion-button fill="clear">
          <ion-icon :icon="personCircleOutline" aria-hidden="true"></ion-icon>
          <router-link :to="{ name: 'profile' }">{{ userName }}</router-link>
        </ion-button>

        <ion-button class="logout-button" fill="clear" @click="logout">Logout</ion-button>
      </div>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import { IonHeader, IonToolbar, IonButton, IonButtons, IonIcon } from '@ionic/vue';
import { pawOutline, personCircleOutline } from 'ionicons/icons';
import { useUserStore } from '@/store/user';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/store/app';
import { computed } from 'vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const userName = computed(() => userStore.userName);
const isMobile = computed(() => appStore.isMobile);
const isLoginPage = computed(() => route.name === 'login');
const isRegisterPage = computed(() => route.name === 'register');

const logout = async () => {
  await userStore.logout();
  router.push({ name: 'login' });
};

const navigateHome = () => {
  router.push({ name: 'home' });
};
</script>


<style scoped>
ion-buttons span {
  margin-right: 1rem;
  color: #fff;
}

/* Override ion button style */
ion-button {
  --color: var(--color-text-lilac) !important;
}

ion-icon {
  padding: 5px;
}

.logout-button {
  --color: var(--color-text-lilac) !important;
  background-color: var(--color-card-background-lilac);
  border: 1px solid var(--color-card-border);
  font-weight: bold;
  border-radius: 20px;
  margin: 10px;
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: var(--color-card-background-lilac);
  box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
}
</style>
