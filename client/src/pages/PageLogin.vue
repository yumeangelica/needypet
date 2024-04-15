<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <!-- Global styling for container element -->
        <div class="login-register-container">
          <img src="/images/needypet_logo.jpeg" alt="NeedyPet logo">
          <div class="custom-valid-message ion-text-center">{{ validMessage }}</div>
          <h4 class="ion-text-center">Login</h4>

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
              <!-- Global button styling for action buttons -->
              <ion-button type="submit" expand="block" class="action-button primary-action-button">Confirm</ion-button>
              <ion-button @click="router.push({ name: 'landing' })" expand="block" class="action-button secondary-action-button">Go Back</ion-button>
            </ion-buttons>

            <!-- Global error message styling -->
            <div v-if="loginError" class="custom-error-message">
              Signing in failed. Please check your credentials and try again.
            </div>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { usePetStore } from '@/store/pet';
import { useAppStore } from '@/store/app';
// Lazy load the components for better performance
const IonPage = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonPage));
const IonContent = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonContent));
const IonItem = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonItem));
const IonInput = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonInput));
const IonButton = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButton));
const IonButtons = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButtons));

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);


const userName = ref('');
const password = ref('');
const loginError = ref(false);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const petStore = usePetStore();

const login = async () => {

  // LoginError is boolean, set to true if login fails
  loginError.value = !await userStore.login(userName.value, password.value);

  // If login was successful, redirect to home page
  if (!loginError.value) {
    router.push({ name: 'home' });
    userName.value = '';
    password.value = '';
    await petStore.getAllPets();
  }
};

const validMessage = ref('');

onBeforeMount(() => {
  if (route.query.accountCreated === 'true') {
    validMessage.value = 'Your account has been successfully created.';
    setTimeout(() => {
      validMessage.value = '';
      route.query.accountCreated = '';
    }, 5000);
  }
});

</script>

