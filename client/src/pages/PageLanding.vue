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
        <div class="copyright">&copy; 2020 - {{ year }} yumeangelica.github.io. All Rights Reserved.</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
// Lazy load the components for better performance
const IonButton = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButton));
const IonPage = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonPage));
const IonContent = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonContent));

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();

const year = new Date().getFullYear();

</script>

<style>
  .copyright {
    margin-top: 30px;
    font-size: 0.7rem;
    text-align: center;
  }

  @media (max-width: 568px) {
    .copyright {
      font-size: 0.55rem;
    }
  }
</style>