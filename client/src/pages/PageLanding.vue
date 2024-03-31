<template>
  <ion-page>
    <ion-header v-if="!isMobile">
      <ion-toolbar>
        <ion-title>Welcome!</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="landing-container">
        <h3>Welcome to NeedyPet!</h3>
        <p>Get started by either creating a new account or logging into an existing one.</p>
        <ion-button @click="goToLogin" expand="block" class="login-button">Login</ion-button>
        <ion-button @click="goToRegister" expand="block" class="create-account-button">Create Account</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue';
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

ion-title {
  color: var(--color-text-lilac);
}

h2,
p {
  color: var(--color-text-lilac);
}

h2 {
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
  text-align: center;
}

.login-button,
.create-account-button {
  --border-radius: 25px;
  margin-top: 10px;
  width: 100%;
  font-weight: bold;
  box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
  --background: var(--color-login-button-and-border);
  --color: var(--color-text-lilac);
}

/* Override ion-button border radius */
ion-button {
  border-radius: 25px !important;
}

.login-button {
  --background: var(--color-login-button-and-border);
  --color: var(--color-text-lilac);
  box-shadow: 1px 1px 4px var(--color-drop-shadow-pink);
}

.create-account-button {
  --background: var(--color-create-account-button);
  --border: 2px solid var(--color-login-button-and-border);
  --color: var(--color-text-lilac);
  box-shadow: 1px 1px 4px var(--color-drop-shadow-pink);
}

.login-button:hover,
.create-account-button:hover,
.login-button:focus,
.create-account-button:focus,
.login-button:active,
.create-account-button:active {
  box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
}
</style>