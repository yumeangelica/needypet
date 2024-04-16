<template>
  <ion-header>
    <ion-toolbar>

      <ion-buttons slot="start">
        <ion-button fill="clear" @click.prevent="navigateTo('home')"><ion-icon :icon="pawOutline" aria-hidden="true"></ion-icon>Home</ion-button>
      </ion-buttons>

      <ion-buttons slot="end" style="display: flex; align-items: center;">
        <ion-button fill="clear" @click.prevent="navigateTo('profile')"><ion-icon :icon="personCircleOutline" aria-hidden="true"></ion-icon>{{ userName
        }}</ion-button>
      </ion-buttons>

    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue';
import { pawOutline, personCircleOutline } from 'ionicons/icons';
import { useUserStore } from '@/store/user';
import { useRouter, useRoute } from 'vue-router';

// Lazy load the components for better performance
const IonHeader = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonHeader));
const IonToolbar = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonToolbar));
const IonButton = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButton));
const IonButtons = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButtons));
const IonIcon = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonIcon));

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const userName = computed(() => userStore.userName);

const navigateTo = (name) => {
  if (route.name !== name) {
    router.push({ name });
  }
};
</script>
