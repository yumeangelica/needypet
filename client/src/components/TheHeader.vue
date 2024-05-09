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
import { computed } from 'vue';
import { pawOutline, personCircleOutline } from 'ionicons/icons';
import { useUserStore } from '@/store/user';
import { useRouter, useRoute } from 'vue-router';
import { IonHeader, IonToolbar, IonButton, IonButtons, IonIcon } from '@ionic/vue';

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
