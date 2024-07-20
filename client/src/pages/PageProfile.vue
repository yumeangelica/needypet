<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div v-if="user" class="edit-pet-profile-container">

          <div v-if="validMessage">
            <p class="custom-valid-message">{{ validMessage }}</p>
          </div>

          <div class="inline-container">
            <h3>{{ user.userName }}</h3>
            <ion-button class="settings-button" fill="clear" @click="toggleSettings"><ion-icon :icon="settingsOutline"></ion-icon></ion-button>
          </div>

          <div class="email">
            <p><strong>Email:</strong> {{ user.email }}</p>
          </div>
          <div class="email-confirmed">
            <p><strong>Email Confirmed:</strong> {{ user.emailConfirmed ? 'Yes' : 'No' }}</p>
            <ion-button v-if="!user.emailConfirmed" class="custom-button small-button" :disabled="isButtonDisabled" fill="clear"
              @click="resendEmailConfirmation">Resend email</ion-button>
          </div>
          <div class="timezone">
            <p><strong>Timezone:</strong> {{ user.timezone }}</p>
          </div>

          <div>
            <ion-button class="custom-button" fill="clear" @click="confirmLogout"><ion-icon :icon="exitOutline"></ion-icon>Logout</ion-button>
            <ion-button v-show="showSettings" class="custom-button" fill="clear" @click="router.push({ name: 'edit-profile' })">Edit
              Profile</ion-button>
            <ion-button v-show="showSettings" class="custom-button" fill="clear" @click="confirmAccountDeletion"><ion-icon
                :icon="trashOutline"></ion-icon>Delete Account</ion-button>
          </div>

          <div v-if="errorMessage">
            <p class="custom-error-message">{{ errorMessage }}</p>
          </div>
        </div>

        <div v-if="!user">
          <p class="ion-text-center">Loading...</p>
        </div>
      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">

import { ref, computed, watchEffect, Ref } from 'vue';
import { onBeforeRouteLeave, useRouter, useRoute } from 'vue-router';
import { trashOutline, exitOutline, settingsOutline } from 'ionicons/icons';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { User } from '@/types/user';


const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const user: Ref<User> = ref(null);
const showSettings = ref(false); // Boolean value to show or hide the settings button, default is false
const validMessage = ref('');
const errorMessage = ref('');
const isButtonDisabled = ref(false); // State for disabling button

// Function to toggle the settings button
const toggleSettings = () => {
  showSettings.value = !showSettings.value; // Toggle the value of showSettings
};

// Function to fetch the user data
const fetchUser = async () => {
  const userData = await userStore.getUserById(userStore.id);
  user.value = userData;
};

// Watch for changes in the route
watchEffect(async () => {
  if (route.name === 'profile') {  // Ensure this is the correct route name for the profile page
    await fetchUser();
  }

  if (route.query.userUpdateSucceefully === 'true') {
    validMessage.value = 'User details updated successfully';
    setTimeout(() => {
      validMessage.value = '';
    }, 5000);
  }
});

// Function to confirm logout action
const confirmLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    logout({ userLoggedOut: 'true' });
  }
};

const logout = async (query) => {
  await userStore.logout();
  router.push({ name: 'landing', query });
};


// Function to confirm account deletion
const confirmAccountDeletion = () => {
  if (window.confirm('Are you sure you want to delete your account?')) {
    deleteAccount();
  }
};

const deleteAccount = async () => {
  const { isSuccess, message } = await userStore.deleteAccount(); // Returns true or false

  if (isSuccess) {
    logout({ userDeleted: 'true' }); // Logout user after successful account deletion
  } else {
    errorMessage.value = message;
  }
};

const resendEmailConfirmation = async () => {

  isButtonDisabled.value = true; // Disable button
  try {
    await userStore.resendEmailConfirmation();
    validMessage.value = 'Please check your email for the confirmation link';
  } catch (error) {
    validMessage.value = 'Failed to resend confirmation email';
  } finally {
    setTimeout(() => {
      isButtonDisabled.value = false; // Enable button after timeout
    }, 30000); // Timeout duration in milliseconds
  }

};

onBeforeRouteLeave(() => {
  showSettings.value = false; // Reset the value of showSettings when leaving the page
});

</script>


<style scoped>
  .email-confirmed {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .small-button {
    --padding-start: 10px;
    --padding-end: 10px;
    font-size: 0.8rem;
    text-align: center;
    height: auto;
    line-height: 1.2;
  }
</style>
