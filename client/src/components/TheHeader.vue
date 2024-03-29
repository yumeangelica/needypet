<template>
  <ion-header v-if="!isMobile && !isLoginPage">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button fill="clear" @click="navigateHome">Home</ion-button>
      </ion-buttons>
      <div slot="end" style="display: flex; align-items: center;">
        <span><router-link :to="{ name: 'profile' }">{{ userName }}</router-link></span>
        <ion-button fill="clear" @click="logout">Logout</ion-button>
      </div>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import { IonHeader, IonToolbar, IonButton, IonButtons } from '@ionic/vue';
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
  --color: var(--font-color-lilac) !important;
}
</style>
