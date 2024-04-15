<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <!-- Global styling for container element -->
        <div class="login-register-container">
          <img src="/images/needypet_logo.jpeg" alt="NeedyPet logo">

          <div class="paw-container">
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
            <div class="password-note">(Password must contain 10 character with at least one uppercase, lowercase, number and special character)</div>
            <!-- Timezone select field -->
            <ion-item class="login-register-field-item" @click="showModal = true" required>
              <ion-label class="custom-timezone-label">{{ selectedTimezone || 'Select Timezone' }}</ion-label>
            </ion-item>
            <TheTimezoneSelectorModal :isOpen="showModal" @update:isOpen="showModal = $event"
              @timezoneSelected="timezone => selectedTimezone = timezone" />

            <!-- Error message -->
            <div v-if="errorMessage" class="custom-error-message">{{ errorMessage }}</div>
            <ion-buttons>
              <!-- Global button styling for action buttons -->
              <ion-button type="submit" expand="block" class="action-button primary-action-button">Confirm</ion-button>
              <ion-button @click="router.push({ name: 'landing' })" expand="block" class="action-button secondary-action-button">Go Back</ion-button>
            </ion-buttons>

          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>



<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
// Lazy load the components for better performance
const IonPage = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonPage));
const IonContent = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonContent));
const IonItem = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonItem));
const IonInput = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonInput));
const IonButton = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButton));
const IonButtons = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButtons));
const IonLabel = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonLabel));
const TheTimezoneSelectorModal = defineAsyncComponent(() => import('@/components/TheTimezoneSelectorModal.vue'));
const IonIcon = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonIcon));

import { pawOutline } from 'ionicons/icons';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const showModal = ref(false);
const username = ref('');
const email = ref('');
const password = ref('');
const selectedTimezone = ref('');
const errorMessage = ref('');

const router = useRouter();
const userStore = useUserStore();

const createAccount = async () => {
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/.test(password.value)) {
    errorMessage.value = 'Password must contain 10 character with at least one uppercase, lowercase, number and special character';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
    return;
  }

  const success = await userStore.createAccount({
    userName: username.value,
    email: email.value,
    newPassword: password.value,
    timezone: selectedTimezone.value
  });

  if (success) {
    console.log('Account created successfully, redirecting to login...');
    router.push({ name: 'login', query: { accountCreated: 'true' } });
    username.value = '';
    email.value = '';
    password.value = '';
    selectedTimezone.value = '';
  } else {
    errorMessage.value = 'Account creation failed, please try again';
  }
};


</script>

<style scoped>
  .password-note {
    font-size: 0.6rem;
    margin: 1rem;
  }
</style>