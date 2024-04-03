<template>
  <ion-page>
    <ion-header v-if="!isMobile">
      <ion-toolbar />
    </ion-header>
    <ion-content class="ion-padding">
      <div class="content-wrapper">
        <div class="landing-container">
          <h4>Loving care for your Needy Pet!</h4>
          <ion-button @click="goToLogin" expand="block" class="action-button">Login</ion-button>
          <ion-button @click="goToRegister" expand="block" class="action-button create-account-button">Create Account</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonContent, IonButton } from '@ionic/vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';

const router = useRouter();
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

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

.action-button {
  --border-radius: 25px;
  margin-top: 10px;
  width: 100%;
  box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
  --background: var(--color-login-button-and-border);
  --color: var(--color-text-lilac);
}

/* Special style for create account button */
.create-account-button {
  --background: var(--color-create-account-button);
  --border: 2px solid var(--color-login-button-and-border);
}
</style>
