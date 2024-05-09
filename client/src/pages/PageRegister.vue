<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <!-- Global styling for container element -->
        <div class="login-register-container">
          <img :src="needypet_logo" alt="NeedyPet logo">

          <div class="paw-header-container">
            <ion-icon :icon="pawOutline"></ion-icon>
            <h4>Create account</h4>
            <ion-icon :icon="pawOutline"></ion-icon>
          </div>

          <form @submit.prevent="createAccount">
            <!-- Username input field -->
            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" v-model="username" type="text" placeholder="Username" required
                aria-label="Username"></ion-input>
            </ion-item>
            <!-- Email input field -->
            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" v-model="email" placeholder="Email" type="email" required aria-label="Email"></ion-input>
            </ion-item>
            <!-- Password input field -->
            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" v-model="password" placeholder="Password" type="password" required id="password"
                aria-label="Password"></ion-input>
            </ion-item>

            <!-- Confirm password input field -->
            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" v-model="confirmPassword" placeholder="Confirm password" type="password" required
                id="confirmPassword" aria-label="Confirm Password"></ion-input>
            </ion-item>

            <div class="strong-password-note">(Password must contain 10 character with at least one uppercase, lowercase, number and special character)</div>
            <!-- Timezone select field -->

            <!-- Timezone select field -->
            <ion-item class="login-register-field-item timezone-selector-field" @click="showModal = true" required>
              <ion-label class="custom-timezone-label">{{ selectedTimezone || 'Select Timezone' }}</ion-label>
            </ion-item>

            <TheTimezoneSelectorModal :isOpen="showModal" @update:isOpen="showModal = $event"
              @timezoneSelected="timezone => selectedTimezone = timezone" />

            <!-- Error message -->
            <div v-if="errorMessage" class="custom-error-message">{{ errorMessage }}</div>
            <ion-buttons>
              <!-- Global button styling for action buttons -->
              <ion-button type="submit" expand="block" class="action-button primary-action-button">Confirm</ion-button>
              <ion-button @click="goBack" expand="block" class="action-button secondary-action-button">Go Back</ion-button>
            </ion-buttons>

          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>



<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonButtons } from '@ionic/vue';
import TheTimezoneSelectorModal from '@/components/TheTimezoneSelectorModal.vue';
import { pawOutline } from 'ionicons/icons';
import needypet_logo from '@/assets/images/needypet_logo.webp';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const userStore = useUserStore();
const showModal = ref(false);
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const selectedTimezone = ref('');
const errorMessage = ref('');


const createAccount = async () => {
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/.test(password.value)) {
    errorMessage.value = 'Password must contain 10 character with at least one uppercase, lowercase, number and special character';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
    return;
  }

  const { isSuccess, message } = await userStore.createAccount({
    userName: username.value,
    email: email.value,
    newPassword: password.value,
    timezone: selectedTimezone.value
  });

  if (isSuccess) {
    console.log('Account created successfully, redirecting to login...');
    router.push({ name: 'login', query: { accountCreated: 'true' } });
    username.value = '';
    email.value = '';
    password.value = '';
    confirmPassword.value = '';
    selectedTimezone.value = '';
  } else {
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
};


// Function to navigate back to the landing page and clear the input fields
const goBack = () => {
  router.push({ name: 'landing' });
  username.value = '';
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  selectedTimezone.value = '';
};


</script>

<style scoped>
  .strong-password-note {
    font-size: 0.6rem;
    margin: 1rem;
  }
</style>