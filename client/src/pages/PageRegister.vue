<template>
  <ion-page>
    <ion-header v-if="!isMobile">
      <ion-toolbar>
        <ion-button @click="navigateToPageLanding" fill="clear">NeedyPet</ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="content-wrapper">
        <div class="account-container">
          <h3 class="ion-text-center">Create Account</h3>
          <form @submit.prevent="createAccount">
            <!-- Username input field -->
            <ion-item>
              <ion-input v-model="username" type="text" placeholder="Username" required aria-label="Username"></ion-input>
            </ion-item>
            <!-- Email input field -->
            <ion-item>
              <ion-input v-model="email" placeholder="Email" type="email" required aria-label="Email"></ion-input>
            </ion-item>
            <!-- Password input field -->
            <ion-item>
              <ion-input v-model="password" placeholder="Password" type="password" required aria-label="Password"></ion-input>
            </ion-item>
            <!-- Timezone select field -->
            <ion-item>
              <ion-select v-model="selectedTimezone">
                <ion-select-option aria-label="timezone" v-for="timezone in timezones" :key="timezone" :value="timezone">{{ timezone
                  }}</ion-select-option>
              </ion-select>
            </ion-item>
            <!-- Send button -->
            <ion-button type="submit" class="account-button" expand="block">Create Account</ion-button>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>



<script setup>
import { ref, computed } from 'vue';
import moment from 'moment-timezone';
import { IonPage, IonHeader, IonToolbar, IonContent, IonItem, IonInput, IonButton, IonSelect, IonSelectOption } from '@ionic/vue';
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
.account-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border-radius: 50px;
  background-color: var(--color-login-background);
  border: 1px solid var(--color-login-button-and-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

ion-item {
  --padding-start: 15px;
  --inner-border-width: 0;
  --inner-padding-end: 15px;
  --background: var(--color-login-input-background);
  --border-radius: 20px;
  --border-color: transparent;
  margin: 12px 0;
}

ion-input,
ion-select {
  --placeholder-color: var(--color-text-default);
  --color: var(--color-text-default);
  font-size: 0.85rem;
}

.account-button {
  margin-top: 25px;
  --background: var(--color-login-button-and-border);
  --color: var(--color-text-lilac);
  font-size: 0.85rem;
}

/* Override ion-button style for a consistent look */
ion-button {
  --border-radius: 25px;
  --color: var(--color-text-lilac);
}

/* Error message styling */
.error-message {
  color: var(--color-error-message);
  text-align: center;
  margin-top: 20px;
  font-size: 0.8rem;
}


/* Mobile styles */
@media (max-width: 568px) {
  .account-container {
    padding: 15px;
  }

  ion-item {
    --padding-start: 10px;
    --inner-padding-end: 10px;
  }

  .account-button,
  ion-input,
  ion-select {
    font-size: 0.8rem;
  }
}
</style>