<template>
  <ion-tab-bar slot="bottom">

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

<script setup lang="ts">
import { pawOutline, personCircleOutline } from 'ionicons/icons';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { useRoute } from 'vue-router';
import router from '@/router';

const route = useRoute();

const navigateTo = (name) => {
  if (route.name !== name) {
    router.push({ name });
  }
};

</script>
