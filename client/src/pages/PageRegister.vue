<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Create Account</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="account-container">

        <h3 class="text-center">Create Account</h3>

        <form @submit.prevent="createAccount">
          <ion-item>
            <ion-input v-model="username" type="text" placeholder="Username" required aria-label="Username"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input v-model="email" placeholder="Email" type="email" required aria-label="Email"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input v-model="password" placeholder="Password" type="password" required aria-label="Password"></ion-input>
          </ion-item>


          <ion-item>
            <ion-select v-model="selectedTimezone">
              <ion-select-option aria-label="timezone" v-for="timezone in timezones" :key="timezone" :value="timezone">{{ timezone
                }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-button type="submit" class="account-button" expand="block">Create Account</ion-button>

        </form>
      </div>
    </ion-content>
  </ion-page>
</template>


<script setup>
import { ref } from 'vue';
import moment from 'moment-timezone';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonSelect, IonSelectOption } from '@ionic/vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';

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
</script>


<style scoped>
ion-title {
  color: var(--color-text-lilac);
}

ion-select {
  color: var(--color-text-lilac);
}

.account-container,
ion-item,
.account-button {
  box-shadow: 1px 1px 4px var(--color-drop-shadow-pink);
  border-radius: 25px;
}

.account-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  border-radius: 50px;
  background-color: var(--color-login-background);
  border: solid 2px var(--color-login-button-and-border);
}

ion-item {
  --padding-start: 20px;
  --inner-border-width: 0;
  --inner-padding-end: 20px;
  --background: var(--color-login-input-background);
  --border-radius: 25px;
  --border-color: var(--color-login-input-border);
  --border-width: 1px;
  --border-style: solid;
  margin-top: 10px;
}

ion-input {
  --placeholder-color: var(--color-text-lilac);
  --placeholder-font-style: italic;
  --color: var(--color-text-lilac);
}

.account-button {
  --border-radius: 25px;
  --background: var(--color-login-button-and-border);
  --color: var(--color-text-lilac);
  margin-top: 30px;
  width: 100%;
  font-weight: bold;
}

.account-button:hover,
.account-button:focus,
.account-button:active {
  box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
}
</style>