<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="content-wrapper">
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
  margin: 100px auto;
  padding: 20px;
  border-radius: 50px;
  border: solid 2px var(--color-login-button-and-border);
  background-color: var(--color-login-background);
  box-shadow: 1px 1px 4px var(--color-drop-shadow-pink);
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
