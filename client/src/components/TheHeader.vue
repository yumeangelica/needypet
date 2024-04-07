<template>
  <ion-header v-if="!isMobile && !isLoginPage && !isRegisterPage && !isLandingPage">
    <ion-toolbar>

      <ion-buttons slot="start">
        <ion-button fill="clear" @click="navigateTo('home')"><ion-icon :icon="pawOutline" aria-hidden="true"></ion-icon>Home</ion-button>
      </ion-buttons>

      <ion-buttons slot="end" style="display: flex; align-items: center;">
        <ion-button fill="clear" @click="navigateTo('profile')"><ion-icon :icon="personCircleOutline" aria-hidden="true"></ion-icon>{{ userName
          }}</ion-button>
      </ion-buttons>

    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
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
const isLandingPage = computed(() => route.name === 'landing');

const navigateTo = (name) => {
  if (route.name !== name) {
    router.push({ name });
  }
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
  padding: 0px 5px;
  color: var(--color-text-lilac);
}
</style>
