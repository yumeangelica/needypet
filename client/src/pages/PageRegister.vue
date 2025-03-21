<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">

        <div class="login-register-container">
          <TheLogoImage altText="Needypet Logo" />

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
            <div v-if="formFieldsErrorDetailsObject.username" class="custom-error-message">{{ formFieldsErrorDetailsObject.username }}</div>
            <!-- Email input field -->
            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" v-model="email" placeholder="Email" type="email" required aria-label="Email"></ion-input>
            </ion-item>
            <div v-if="formFieldsErrorDetailsObject.email" class="custom-error-message">{{ formFieldsErrorDetailsObject.email }}</div>
            <!-- Password input field -->
            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" v-model="password" @input="validatePassword" :type="passwordFieldType"
                placeholder="Password" required id="password" aria-label="Password"></ion-input>

              <ion-button fill="clear" @click="togglePasswordVisibility" class="show-password-button">
                <ion-icon :icon="passwordFieldType === 'password' ? eyeOutline : eyeOffOutline"></ion-icon>
              </ion-button>
            </ion-item>

            <div class="strong-password-note">
              <ul>
                <li :class="{ 'valid': passwordValidations.uppercase }">At least one uppercase</li>
                <li :class="{ 'valid': passwordValidations.lowercase }">At least one lowercase</li>
                <li :class="{ 'valid': passwordValidations.number }">At least one number</li>
                <li :class="{ 'valid': passwordValidations.special }"> Valid special character</li>
                <li :class="{ 'valid': passwordValidations.minLength }">Minimum 10 characters</li>
              </ul>
            </div>

            <!-- Confirm password input field -->
            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" v-model="confirmPassword" placeholder="Confirm password" :type="passwordFieldType" required
                id="confirmPassword" aria-label="Confirm Password"></ion-input>

              <ion-button fill="clear" @click="togglePasswordVisibility" class="show-password-button">
                <ion-icon :icon="passwordFieldType === 'password' ? eyeOutline : eyeOffOutline"></ion-icon>
              </ion-button>
            </ion-item>
            <div v-if="formFieldsErrorDetailsObject.newPassword" class="custom-error-message">{{ formFieldsErrorDetailsObject.newPassword }}</div>


            <!-- Timezone select field -->
            <ion-item class="login-register-field-item timezone-selector-field" @click="showModal = true" required>
              <ion-label class="custom-timezone-label">{{ selectedTimezone || 'Select Timezone' }}</ion-label>
            </ion-item>
            <div v-if="formFieldsErrorDetailsObject.timezone" class="custom-error-message">{{ formFieldsErrorDetailsObject.timezone }}</div>

            <TheTimezoneSelectorModal :isOpen="showModal" @update:isOpen="showModal = $event"
              @timezoneSelected="timezone => selectedTimezone = timezone" />

            <ion-buttons>
              <!-- Global button styling for action buttons -->
              <ion-button type="submit" expand="block" class="action-button primary-action-button">Confirm</ion-button>
              <ion-button @click="goBack" expand="block" class="action-button secondary-action-button">Go Back</ion-button>
            </ion-buttons>

          </form>
        </div>


      </div>
      <TheFooter />
    </ion-content>
  </ion-page>
</template>



<script setup lang="ts">
import { Ref, ref, computed } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonButtons } from '@ionic/vue';
import TheTimezoneSelectorModal from '@/components/TheTimezoneSelectorModal.vue';
import { pawOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import TheLogoImage from '@/components/TheLogoImage.vue';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const userStore = useUserStore();
const showModal: Ref<boolean> = ref(false);
const username: Ref<string> = ref('');
const email: Ref<string> = ref('');
const password: Ref<string> = ref('');
const confirmPassword: Ref<string> = ref('');
const selectedTimezone: Ref<string> = ref('');
const errorMessage: Ref<string> = ref('');
const passwordFieldType: Ref<'password' | 'text'> = ref('password');

const formFieldsErrorDetailsObject = ref({
  username: '' as string,
  email: '' as string,
  newPassword: '' as string,
  timezone: '' as string
});

const passwordValidations = ref({
  uppercase: false as boolean,
  lowercase: false as boolean,
  number: false as boolean,
  special: false as boolean,
  minLength: false as boolean
});

const validatePassword = () => {
  const pwd = password.value;

  // Special characters that are allowed
  const allowedSpecialChars = /[@$!%*?&.\-_]/;

  // Special characters that are not allowed
  const forbiddenSpecialChars = /[^a-zA-Z0-9@$!%*?&.\-_]/;


  passwordValidations.value.uppercase = /[A-Z]/.test(pwd);
  passwordValidations.value.lowercase = /[a-z]/.test(pwd);
  passwordValidations.value.number = /[0-9]/.test(pwd);
  passwordValidations.value.special = allowedSpecialChars.test(pwd) && !forbiddenSpecialChars.test(pwd);
  passwordValidations.value.minLength = pwd.length >= 10;
};

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};


const createAccount = async () => {
  if (!passwordValidations.value.uppercase ||
    !passwordValidations.value.lowercase ||
    !passwordValidations.value.number ||
    !passwordValidations.value.special ||
    !passwordValidations.value.minLength) {
    formFieldsErrorDetailsObject.value.newPassword = 'Password does not meet the requirements.';
    setTimeout(() => {
      formFieldsErrorDetailsObject.value.newPassword = '';
    }, 5000);
    return;
  }

  if (password.value !== confirmPassword.value) {
    formFieldsErrorDetailsObject.value.newPassword = 'Passwords do not match';
    setTimeout(() => {
      formFieldsErrorDetailsObject.value.newPassword = '';
    }, 5000);
    return;
  }

  const { isSuccess, message, errorDetails } = await userStore.createAccount({
    userName: username.value,
    email: email.value,
    newPassword: password.value,
    timezone: selectedTimezone.value
  });

  if (isSuccess) {
    router.push({ name: 'login', replace: true });
    appStore.addNotification(message, 'success');
    username.value = '';
    email.value = '';
    password.value = '';
    confirmPassword.value = '';
    selectedTimezone.value = '';
  } else {
    formFieldsErrorDetailsObject.value = {
      username: errorDetails?.userName?.[0] || '',
      email: errorDetails?.email?.[0] || '',
      newPassword: errorDetails?.newPassword?.[0] || '',
      timezone: errorDetails?.timezone?.[0] || ''
    };
    errorMessage.value = message? message : 'An error occurred. Please try again later.';
    setTimeout(() => {
      formFieldsErrorDetailsObject.value = {
        username: '',
        email: '',
        newPassword: '',
        timezone: ''
      };
      errorMessage.value = '';
    }, 5000);
  }
};

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