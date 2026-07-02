<template>
  <div class="page-root">
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="login-register-container auth-panel auth-card auth-form-card auth-register-card overflow-y-auto max-h-[90vh]">
        <TheLogoImage altText="NeedyPet Logo" />

        <div class="auth-card-header paw-header-container">
          <PawPrint class="inline-block w-5 h-5" aria-hidden="true" />
          <h1 class="text-[1.15rem] max-[568px]:text-[0.9rem]">Join the pack!</h1>
          <PawPrint class="inline-block w-5 h-5" aria-hidden="true" />
        </div>

        <p class="auth-subtitle">Create a new account to start caring for your pets 🐾</p>

        <form class="auth-form auth-register-form" @submit.prevent="createAccount">
          <!-- Username input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="username" type="text" placeholder="Pick a username (your pet parent name)" required aria-label="Username"
              :aria-invalid="formFieldsErrorDetailsObject.username ? true : undefined"
              :aria-describedby="formFieldsErrorDetailsObject.username ? 'reg-username-error' : undefined" />
          </div>
          <div v-if="formFieldsErrorDetailsObject.username" id="reg-username-error" class="custom-error-message" role="alert">
            {{ formFieldsErrorDetailsObject.username }}
          </div>

          <!-- Email input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="email" placeholder="Your email" type="email" required aria-label="Email"
              :aria-invalid="formFieldsErrorDetailsObject.email ? true : undefined"
              :aria-describedby="formFieldsErrorDetailsObject.email ? 'reg-email-error' : undefined" />
          </div>
          <div v-if="formFieldsErrorDetailsObject.email" id="reg-email-error" class="custom-error-message" role="alert">
            {{ formFieldsErrorDetailsObject.email }}
          </div>

          <!-- Password input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="password" @input="validatePassword" :type="passwordFieldType" placeholder="Password (your secret paw code)" required
              id="password" aria-label="Password" aria-describedby="reg-password-requirements" />
            <button type="button" class="show-password-button" :aria-label="passwordFieldType === 'password' ? 'Show password' : 'Hide password'" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" aria-hidden="true" />
              <EyeOff v-else class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div class="strong-password-note">
            <ul id="reg-password-requirements" aria-live="polite">
              <li :class="{ 'valid': passwordValidations.uppercase }">A big-cat letter (A-Z)</li>
              <li :class="{ 'valid': passwordValidations.lowercase }">A little-pup letter (a-z)</li>
              <li :class="{ 'valid': passwordValidations.number }">A number (0-9)</li>
              <li :class="{ 'valid': passwordValidations.special }">A special paw mark (!@#$%^&amp;*)</li>
              <li :class="{ 'valid': passwordValidations.minLength }">Nice and long (10+ characters)</li>
            </ul>
          </div>

          <!-- Confirm password input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="confirmPassword" placeholder="Confirm password (type your paw code again)" :type="passwordFieldType" required
              id="confirmPassword" aria-label="Confirm Password" :aria-invalid="formFieldsErrorDetailsObject.newPassword ? true : undefined"
              :aria-describedby="formFieldsErrorDetailsObject.newPassword ? 'reg-password-error' : undefined" />
            <button type="button" class="show-password-button" :aria-label="passwordFieldType === 'password' ? 'Show password' : 'Hide password'" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" aria-hidden="true" />
              <EyeOff v-else class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div v-if="formFieldsErrorDetailsObject.newPassword" id="reg-password-error" class="custom-error-message" role="alert">
            {{ formFieldsErrorDetailsObject.newPassword }}
          </div>

          <!-- Timezone select field -->
          <div class="auth-field cursor-pointer" role="button" tabindex="0" aria-haspopup="dialog"
            :aria-label="`Select timezone, current: ${selectedTimezone || 'none'}`"
            :aria-describedby="formFieldsErrorDetailsObject.timezone ? 'reg-timezone-error' : undefined" @click="showModal = true"
            @keydown.enter.prevent="showModal = true" @keydown.space.prevent="showModal = true">
            <span class="auth-field-input auth-field-value" :class="{ 'text-foreground/70': !selectedTimezone }">
              {{ selectedTimezone || 'Pick your timezone' }}
            </span>
          </div>
          <div v-if="formFieldsErrorDetailsObject.timezone" id="reg-timezone-error" class="custom-error-message" role="alert">
            {{ formFieldsErrorDetailsObject.timezone }}
          </div>
          <p class="auth-field-hint">So your pets' daily tasks refresh at your own midnight 🐾</p>

          <TheTimezoneSelectorModal :isOpen="showModal" @update:isOpen="showModal = $event"
            @timezoneSelected="timezone => selectedTimezone = timezone" />

          <div class="auth-action-row">
            <button type="submit" aria-label="Create account" class="action-button primary-action-button auth-action-button">Join the Pack</button>
            <button type="button" @click="goBack" class="action-button secondary-action-button auth-action-button">← Back</button>
          </div>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, PawPrint } from '@lucide/vue';
import { computed, type Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import TheFooter from '@/components/TheFooter.vue';
import TheLogoImage from '@/components/TheLogoImage.vue';
import TheTimezoneSelectorModal from '@/components/TheTimezoneSelectorModal.vue';
import { isPasswordValid, validatePasswordRules } from '@/lib/passwordRules';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';

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
  timezone: '' as string,
});

const passwordValidations = ref({
  uppercase: false as boolean,
  lowercase: false as boolean,
  number: false as boolean,
  special: false as boolean,
  minLength: false as boolean,
});

const validatePassword = () => {
  passwordValidations.value = validatePasswordRules(password.value);
};

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const createAccount = async () => {
  if (!isPasswordValid(passwordValidations.value)) {
    formFieldsErrorDetailsObject.value.newPassword =
      "Your paw code doesn't meet all the requirements yet.";
    setTimeout(() => {
      formFieldsErrorDetailsObject.value.newPassword = '';
    }, 3000);
    return;
  }

  if (password.value !== confirmPassword.value) {
    formFieldsErrorDetailsObject.value.newPassword = "Your paw codes don't match.";
    setTimeout(() => {
      formFieldsErrorDetailsObject.value.newPassword = '';
    }, 3000);
    return;
  }

  const { isSuccess, message, errorDetails } = await userStore.createAccount({
    userName: username.value,
    email: email.value,
    newPassword: password.value,
    timezone: selectedTimezone.value,
  });

  if (isSuccess) {
    router.push({ name: 'login', replace: true });
    appStore.addNotification(message ?? 'Welcome to the pack! 🐾', 'success');
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
      timezone: errorDetails?.timezone?.[0] || '',
    };
    errorMessage.value = message ? message : 'Something went wrong. Please try again later.';
    setTimeout(() => {
      formFieldsErrorDetailsObject.value = {
        username: '',
        email: '',
        newPassword: '',
        timezone: '',
      };
      errorMessage.value = '';
    }, 3000);
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
