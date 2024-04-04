<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <!-- Global styling for container element -->
        <div class="login-register-container">
          <h3 class="ion-text-center">Login</h3>

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
              <ion-button @click="navigateToPageLanding" expand="block" class="action-button secondary-action-button">Go Back</ion-button>
            </ion-buttons>

            <!-- Global error message styling -->
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
import { usePetStore } from '@/store/pet';
import { IonPage, IonContent, IonItem, IonInput, IonButton, IonButtons } from '@ionic/vue';

import { useAppStore } from '@/store/app';
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);


const userName = ref('');
const password = ref('');
const loginError = ref(false);
const router = useRouter();
const userStore = useUserStore();
const petStore = usePetStore();

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
/* Mobile styles */
@media (max-width: 568px) {
  .login-register-container {
    padding: 15px;
  }

  .login-register-field-item {
    --padding-start: 15px;
    --inner-padding-end: 15px;
    margin-bottom: 12px;
  }

  .action-button,
  .login-register-field-input {
    font-size: 0.8rem;
  }
}
</style>
