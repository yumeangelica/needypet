<template>
  <ion-tab-bar slot="bottom" v-if="!isLoginPage && !isRegisterPage && !isLandingPage">

    <ion-tab-button tab="home" @click.prevent="navigateTo('home')">
      <ion-icon aria-hidden="true" :icon="pawOutline" />
      <ion-label>Home</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="profile" @click.prevent="navigateTo('profile')">
      <ion-icon aria-hidden="true" :icon="personCircleOutline" />
      <ion-label>Profile</ion-label>
    </ion-tab-button>

  </ion-tab-bar>
</template>

<script setup>
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { pawOutline, personCircleOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import router from '@/router';

const route = useRoute();
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
.ion-tab-button,
ion-label,
ion-icon {
  color: var(--color-text-lilac);
}
</style>