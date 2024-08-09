<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="edit-pet-profile-container">
          <form @submit.prevent="submitForm" class="edit-pet-profile-form">
            <h3>Edit Profile:</h3>
            <ion-item>
              <ion-input v-model="editData.userName" type="text" required placeholder="Username"></ion-input>
            </ion-item>
            <div v-if="errorDetailsObject.userName" class="custom-error-message">{{ errorDetailsObject.userName }}</div>
            <ion-item>
              <ion-input v-model="editData.email" type="email" required placeholder="Email"></ion-input>
            </ion-item>
            <div v-if="errorDetailsObject.email" class="custom-error-message">{{ errorDetailsObject.email }}</div>
            <ion-item @click="showModal = true">
              <ion-label class="custom-timezone-label timezone-selector-field">{{ editData.timezone || 'Select Timezone' }}</ion-label>
            </ion-item>
            <div v-if="errorDetailsObject.timezone" class="custom-error-message">{{ errorDetailsObject.timezone }}</div>
            <TheTimezoneSelectorModal :isOpen="showModal" @update:isOpen="showModal = $event"
              @timezoneSelected="timezone => editData.timezone = timezone" />
            <ion-item>
              <ion-input v-model="editData.currentPassword" :type="passwordFieldType" required placeholder="Current Password"></ion-input>
              <ion-button fill="clear" @click="togglePasswordVisibility" class="show-password-button">
                <ion-icon :icon="passwordFieldType === 'password' ? eyeOutline : eyeOffOutline"></ion-icon>
              </ion-button>
            </ion-item>
            <div v-if="errorDetailsObject.currentPassword" class="custom-error-message">{{ errorDetailsObject.currentPassword }}</div>
            <span class="custom-error-message" v-if="showPasswordNotification">Please enter your current password</span>
            <ion-buttons class="button-container">
              <ion-button class="edit-pet-profile-button" type="submit" expand="block">Save Changes</ion-button>
              <ion-button class="edit-pet-profile-button" @click="router.push({ name: 'profile' })" expand="block" fill="clear">Cancel</ion-button>
            </ion-buttons>

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
import { ref, onBeforeMount, computed, Ref } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useAppStore } from '@/store/app';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonPage, IonButtons, IonIcon } from '@ionic/vue';
import TheTimezoneSelectorModal from '@/components/TheTimezoneSelectorModal.vue';
import { User } from '@/types/user';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const userStore = useUserStore();
const router = useRouter();

const showPasswordNotification = ref(false);
const passwordFieldType = ref<'password' | 'text'>('password');

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const errorMessage = ref('');
const errorDetailsObject = ref({
  userName: '',
  email: '',
  timezone: '',
  currentPassword: ''
});

const showModal = ref(false);

const originalData = ref({});
// Placeholder for user details
const editData = ref({
  userName: '',
  email: '',
  timezone: '',
  currentPassword: '',
});

const user: Ref<User> = ref(null);

const fetchUser = async () => {
  const userData = await userStore.getUserById(userStore.id);
  user.value = userData;
  originalData.value = { ...userData };
};

// Ensuring the user data is fetched before the component is mounted
onBeforeMount(async () => {
  await fetchUser();

  editData.value = {
    userName: user.value.userName,
    email: user.value.email,
    timezone: user.value.timezone,
    currentPassword: '',
  };
});

onBeforeRouteLeave((to, from, next) => {
  if (JSON.stringify(editData.value) !== JSON.stringify(originalData.value)) { // Check if the form data has changed
    editData.value = { ...originalData.value } as { userName: string; email: string; timezone: string; currentPassword: string };
  }
  next();
});

const submitForm = async () => {
  if (!editData.value.currentPassword) {
    showPasswordNotification.value = true;
    setTimeout(() => {
      showPasswordNotification.value = false;
    }, 5000);
    return;
  }

  const { isSuccess, message, errorDetails } = await userStore.updateUserProfile(editData.value);
  if (isSuccess) {
    editData.value.currentPassword = ''; // Clear the password field
    originalData.value = { ...editData.value };
    router.push({ name: 'profile', query: { userUpdateSuccessfully: 'true' } }); // Ensuring the user is redirected to the profile page
  } else {
    errorDetailsObject.value = {
      userName: errorDetails?.userName?.[0] || '',
      email: errorDetails?.email?.[0] || '',
      timezone: errorDetails?.timezone?.[0] || '',
      currentPassword: errorDetails?.currentPassword?.[0] ? 'Password does not meet the requirements' : ''
    };
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = '';
      errorDetailsObject.value = {
        userName: '',
        email: '',
        timezone: '',
        currentPassword: ''
      };
    }, 5000);
  }
};
</script>

<style scoped>
  .custom-error-message {
    color: var(--ion-color-danger);
    font-size: 0.8rem;
    margin-top: 4px;
  }
</style>
