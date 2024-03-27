<template>
  <ion-tab-bar slot="bottom" v-if="!isLoginPage">
    <ion-tab-button tab="home" @click.prevent="navigateTo('/')">
      <ion-icon aria-hidden="true" :icon="pawOutline" color="primary" />
      <ion-label color="primary">Home</ion-label>
    </ion-tab-button>
    <ion-tab-button tab="profile" @click.prevent="navigateTo('/profile')">
      <ion-icon aria-hidden="true" :icon="personCircleOutline" color="primary" />
      <ion-label color="primary">Profile</ion-label>
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

const navigateTo = (path) => {
  if (route.path !== path) {
    router.push(path);
  }
};

</script>

<style scoped></style>