<template>
  <ion-page>
    <ion-header v-if="!isMobile">
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="login-container">

        <form @submit.prevent="login">
          <ion-item>
            <ion-input type="text" v-model="userName" placeholder="Enter your username" aria-label="Username"></ion-input>
          </ion-item>

          <ion-item>
            <ion-input type="password" v-model="password" placeholder="Enter your password" aria-label="Password"></ion-input>
          </ion-item>

          <ion-button type="submit" class="login-button">Login</ion-button>

          <div v-if="loginError" class="error-message">
            Signing in failed. Please check your credentials and try again.
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton } from '@ionic/vue';


const userName = ref('');
const password = ref('');
const loginError = ref(false);
const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();
const petStore = usePetStore();
const isMobile = computed(() => appStore.isMobile);

const login = async () => {

  // LoginError is boolean, set to true if login fails
  loginError.value = !await userStore.login(userName.value, password.value);

  // If login was successful, redirect to home page
  if (!loginError.value) {
    await petStore.getAllPets();
    router.push({ name: 'home' });
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  border-radius: 50px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: var(--login-container-bg);
}

ion-item {
  --padding-start: 20px;
  --inner-border-width: 0;
  --inner-padding-end: 20px;
  --background: var(--login-input-bg);
  --border-radius: 25px;
  margin-top: 10px;
}

ion-input {
  --placeholder-color: var(--font-color-lilac);
  --placeholder-font-style: italic;
}

.login-button {
  --border-radius: 25px;
  --background: var(--login-btn-bg);
  --background-activated: #5034bf;
  --background-focused: #7044ff;
  --color: var(--font-color-lilac);
  margin-top: 30px;
  width: 100%;
}

.error-message {
  color: #ff3b30;
  text-align: center;
  margin-top: 20px;
}

ion-toolbar ion-title {
  color: var(--font-color-lilac);
}
</style>
