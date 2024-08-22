<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="edit-pet-profile-container">
          <form @submit.prevent="submitForm" class="edit-pet-profile-form">
            <h3>Change Password:</h3>
            <!-- Current Password input field -->
            <ion-item>
              <ion-input v-model="currentPassword" :type="passwordFieldType" required placeholder="Current Password"></ion-input>
              <ion-button fill="clear" @click="togglePasswordVisibility" class="show-password-button">
                <ion-icon :icon="passwordFieldType === 'password' ? eyeOutline : eyeOffOutline"></ion-icon>
              </ion-button>
            </ion-item>
            <div v-if="errorDetailsObject.currentPassword" class="custom-error-message">{{ errorDetailsObject.currentPassword }}</div>

            <!-- New Password input field -->
            <ion-item>
              <ion-input v-model="newPassword" @input="validatePassword" :type="passwordFieldType" required placeholder="New Password"></ion-input>
              <ion-button fill="clear" @click="togglePasswordVisibility" class="show-password-button">
                <ion-icon :icon="passwordFieldType === 'password' ? eyeOutline : eyeOffOutline"></ion-icon>
              </ion-button>
            </ion-item>
            <div v-if="errorDetailsObject.newPassword" class="custom-error-message">{{ errorDetailsObject.newPassword }}</div>

            <div class="strong-password-note">
              <ul>
                <li :class="{ 'valid': passwordValidations.uppercase }">At least one uppercase</li>
                <li :class="{ 'valid': passwordValidations.lowercase }">At least one lowercase</li>
                <li :class="{ 'valid': passwordValidations.number }">At least one number</li>
                <li :class="{ 'valid': passwordValidations.special }">At least one special character</li>
                <li :class="{ 'valid': passwordValidations.minLength }">Minimum 10 characters</li>
              </ul>
            </div>

            <ion-buttons class="button-container">
              <ion-button class="edit-pet-profile-button" type="submit" expand="block">Change Password</ion-button>
              <ion-button class="edit-pet-profile-button" @click="router.push({ name: 'profile' })" expand="block" fill="clear">Cancel</ion-button>
            </ion-buttons>

            <!-- Global error message styling -->
            <div v-if="errorMessage" class="custom-error-message">
              {{ errorMessage }}
            </div>
          </form>
        </div>


      </div>
      <TheFooter />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonPage, IonButtons } from '@ionic/vue';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const userStore = useUserStore();
const router = useRouter();

const errorMessage = ref('');
const errorDetailsObject = ref({
  currentPassword: '',
  newPassword: ''
});

const currentPassword = ref('');
const newPassword = ref('');
const passwordFieldType = ref<'password' | 'text'>('password');

const passwordValidations = ref({
  uppercase: false,
  lowercase: false,
  number: false,
  special: false,
  minLength: false
});

const validatePassword = () => {
  const pwd = newPassword.value;
  passwordValidations.value.uppercase = /[A-Z]/.test(pwd);
  passwordValidations.value.lowercase = /[a-z]/.test(pwd);
  passwordValidations.value.number = /[0-9]/.test(pwd);
  passwordValidations.value.special = /[!@#$%^&*]/.test(pwd);
  passwordValidations.value.minLength = pwd.length >= 10;
};

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const submitForm = async () => {
  const { isSuccess, message, errorDetails } = await userStore.changePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value
  });

  if (isSuccess) {
    currentPassword.value = '';
    newPassword.value = '';
    router.push({ name: 'profile', query: { passwordChangedSuccessfully: 'true' } });
  } else {
    errorDetailsObject.value = {
      currentPassword: errorDetails?.currentPassword?.[0] || '',
      newPassword: errorDetails?.newPassword?.[0] || ''
    };
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = '';
      errorDetailsObject.value = {
        currentPassword: '',
        newPassword: ''
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

.strong-password-note {
  font-size: 0.6rem;
  margin: 1rem;
}

.strong-password-note ul {
  list-style-type: disc;
  margin: 0;
  padding: 0;
  list-style-position: inside;
  display: flex;
  flex-wrap: wrap;
}

.strong-password-note li {
  width: 50%;
  box-sizing: border-box;
  color: red;
}

.strong-password-note li.valid {
  color: green;
}
</style>
