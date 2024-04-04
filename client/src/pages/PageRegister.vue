<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <!-- Global styling for container element -->
        <div class="login-register-container">
          <h3 class="ion-text-center">Create Account</h3>
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
              <ion-input class="login-register-field-input" v-model="password" placeholder="Password" type="password" required
                aria-label="Password"></ion-input>
            </ion-item>
            <!-- Timezone select field -->
            <ion-item class="login-register-field-item">
              <ion-select v-model="selectedTimezone">
                <ion-select-option aria-label="timezone" v-for="timezone in timezones" :key="timezone" :value="timezone">{{ timezone
                  }}</ion-select-option>
              </ion-select>
            </ion-item>


            <ion-buttons>
              <!-- Global button styling for action buttons -->
              <ion-button type="submit" expand="block" class="action-button primary-action-button">Confirm</ion-button>
              <ion-button @click="navigateToPageLanding" expand="block" class="action-button secondary-action-button">Go Back</ion-button>
            </ion-buttons>

          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>



<script setup>
import { ref, computed } from 'vue';
import moment from 'moment-timezone';
import { IonPage, IonContent, IonItem, IonInput, IonButton, IonSelect, IonSelectOption, IonButtons } from '@ionic/vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';

import { useAppStore } from '@/store/app';
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const username = ref('');
const email = ref('');
const password = ref('');

const timezones = ref(moment.tz.names());
const selectedTimezone = ref('Europe/Helsinki');

const router = useRouter();
const userStore = useUserStore();


const createAccount = async () => {
  const success = await userStore.createAccount({
    userName: username.value,
    email: email.value,
    newPassword: password.value,
    timezone: selectedTimezone.value
  });

  if (success) {
    console.log('Account created successfully, redirecting to login...');
    router.push({ name: 'login' });
  } else {
    console.error('Failed to create account, please try again.');
  }
};


const navigateToPageLanding = () => {
  router.push({ name: 'landing' });
};

</script>


<style scoped>
ion-select {
  --placeholder-color: var(--color-text-default);
  --color: var(--color-text-default);
  font-size: 0.85rem;
}


/* Mobile styles */
@media (max-width: 568px) {
  .login-register-container {
    padding: 15px;
  }

  .login-register-field-item {
    --padding-start: 10px;
    --inner-padding-end: 10px;
  }

  .action-button,
  .login-register-field-input {
    font-size: 0.8rem;
  }

  ion-select {
    font-size: 0.8rem;
  }
}
</style>