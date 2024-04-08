<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="login-register-container">
          <img src="/images/needypet_logo.jpeg" alt="NeedyPet logo">
          <h4 class="ion-text-center">Loving care for your Needy Pet!</h4>
          <!-- Global button styling for action buttons -->
          <ion-button @click="router.push({ name: 'login' });" expand="block" class="action-button primary-action-button">Login</ion-button>
          <ion-button @click="router.push({ name: 'register' })" expand="block" class="action-button secondary-action-button">Create
            Account</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

import { useAppStore } from '@/store/app';
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();

</script>
