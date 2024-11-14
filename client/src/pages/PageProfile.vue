<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div v-if="user" class="edit-pet-profile-container">

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

            <ion-button v-show="showSettings" class="custom-button" fill="clear" @click="router.push({ name: 'change-password' })">Change password</ion-button>

            <ion-button v-show="showSettings" class="custom-button" fill="clear" @click="confirmAccountDeletion"><ion-icon
                :icon="trashOutline"></ion-icon>Delete Account</ion-button>
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
  if (route.query.userUpdateSuccessfully === 'true') {
    appStore.addNotification('User updated successfully', 'success');
  }

  if (route.query.passwordChangedSuccessfully === 'true') {
    appStore.addNotification('Password changed successfully', 'success');
  }
});

// Function to confirm logout action
const confirmLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    logout();
  }
};

const logout = async () => {
  await userStore.logout();
  router.push({ name: 'landing' });
  appStore.addNotification('You have been logged out', 'success');
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
    appStore.addNotification('Your account has been deleted', 'success');
    logout(); // Logout user after successful account deletion
  } else {
    appStore.addNotification(message, 'error');
  }
};

const resendEmailConfirmation = async () => {

  isButtonDisabled.value = true; // Disable button

  const isSuccess = await userStore.resendEmailConfirmation();

  if (isSuccess) {
    appStore.addNotification('Please check your email for the confirmation link', 'success');
  } else {
    appStore.addNotification('Failed to resend email confirmation, please try again later', 'error');
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
