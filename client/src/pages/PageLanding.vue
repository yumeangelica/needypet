<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="landing-container">
          <h4 class="ion-text-center">Loving care for your Needy Pet!</h4>
          <!-- Global button styling for action buttons -->
          <ion-button @click="goToLogin" expand="block" class="action-button primary-action-button">Login</ion-button>
          <ion-button @click="goToRegister" expand="block" class="action-button secondary-action-button">Create Account</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

import { useAppStore } from '@/store/app';
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();

const goToRegister = () => {
  router.push({ name: 'register' });
};

const goToLogin = () => {
  router.push({ name: 'login' });
};
</script>

<style scoped>
.landing-container {
  max-width: 500px;
  margin: 5vh auto;
  padding: 20px;
  border-radius: 50px;
  background-color: var(--color-login-background);
  border: 1px solid var(--color-login-button-and-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Mobile styles */
@media (max-width: 568px) {
  .landing-container {
    padding: 15px;
  }
  .action-button {
    font-size: 0.85rem;
  }
}
</style>
