<template>
  <ion-page>
    <ion-header v-if="!isMobile">
      <ion-toolbar>
        <ion-button @click="navigateToPageLanding" fill="clear">NeedyPet</ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="content-wrapper">
        <div class="login-container">
          <h3 class="ion-text-center">Login</h3>

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
import { IonPage, IonHeader, IonToolbar, IonContent, IonItem, IonInput, IonButton } from '@ionic/vue';


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

const navigateToPageLanding = () => {
  router.push({ name: 'landing' });
};
</script>


<style scoped>
ion-button {
  --color: var(--color-text-lilac);
}

.login-container {
  max-width: 400px;
  margin: 5vh auto;
  padding: 20px;
  border-radius: 50px;
  background-color: var(--color-login-background);
  border: 1px solid var(--color-login-button-and-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

ion-item {
  --padding-start: 20px;
  --inner-border-width: 0;
  --inner-padding-end: 20px;
  --background: var(--color-login-input-background);
  --border-radius: 20px;
  margin-bottom: 15px;
}

ion-input {
  --placeholder-color: var(--color-text-default);
  --placeholder-font-style: italic;
  --color: var(--color-text-lilac);
  font-size: 0.85rem;
}

.login-button {
  --border-radius: 25px;
  --background: var(--color-login-button-and-border);
  --color: var(--color-text-lilac);
  margin-top: 20px;
  width: 100%;
  font-size: 0.85rem;
}

.error-message {
  color: var(--color-error-message);
  text-align: center;
  margin-top: 20px;
  font-size: 0.8rem;
}


/* Mobile styles */
@media (max-width: 568px) {
  .login-container {
    margin: 10px auto;
    padding: 15px;
  }

  ion-item {
    --padding-start: 15px;
    --inner-padding-end: 15px;
    margin-bottom: 12px;
  }

  .login-button,
  ion-input {
    font-size: 0.8rem;
  }
}
</style>
