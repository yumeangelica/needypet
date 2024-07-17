<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="login-register-container">
          <img :src="needypet_logo" alt="NeedyPet logo">

          <div class="paw-header-container">
            <ion-icon :icon="pawOutline"></ion-icon>
            <h4>Login</h4>
            <ion-icon :icon="pawOutline"></ion-icon>
          </div>

          <div class="custom-valid-message ion-text-center">{{ validMessage }}</div>

          <form @submit.prevent="login">
            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" type="text" v-model="userName" placeholder="Enter your username"
                aria-label="Username"></ion-input>
            </ion-item>

            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" type="password" v-model="password" placeholder="Enter your password"
                aria-label="Password"></ion-input>
            </ion-item>

            <ion-buttons>
              <ion-button type="submit" expand="block" class="action-button primary-action-button">Confirm</ion-button>
              <ion-button @click="goBack" expand="block" class="action-button secondary-action-button">Go Back</ion-button>
            </ion-buttons>

            <!-- Did you forget your password button -->
            <ion-button @click="router.push({ name: 'request-password-reset' })" expand="block" class="action-button secondary-action-button">Forgot
              Password</ion-button>

            <div v-if="errorMessage" class="custom-error-message">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { usePetStore } from '@/store/pet';
import { useAppStore } from '@/store/app';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonPage, IonButtons } from '@ionic/vue';
import { pawOutline } from 'ionicons/icons';
import needypet_logo from '@/assets/images/needypet_logo.webp';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const userName = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const petStore = usePetStore();

const validMessage = ref('');

const login = async () => {

  // LoginError is boolean, set to true if login fails
  const { isSuccess, message } = await userStore.login(userName.value, password.value);

  // If login was successful, redirect to home page
  if (isSuccess) {
    router.push({ name: 'home' });
    userName.value = '';
    password.value = '';
    await petStore.getAllPets();
  } else {
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
};

// Display a message if the account was successfully created, get the query parameter from the URL and display the message
onMounted(() => {
  if (route.query.accountCreated === 'true') {
    validMessage.value = 'Your account has been successfully created.\nPlease check your email to verify your account.';
    setTimeout(() => {
      validMessage.value = '';
      route.query.accountCreated = '';
    }, 5000);
  }
});

// Function to go back to the landing page, and clear the input fields
const goBack = () => {
  router.push({ name: 'landing' });
  userName.value = '';
  password.value = '';
};

</script>