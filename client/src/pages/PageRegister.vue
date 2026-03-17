<template>
  <div class="page-root">
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="login-register-container" style="overflow-y: auto; max-height: 90vh;">
        <TheLogoImage altText="NeedyPet Logo" />

        <div class="paw-header-container">
          <PawPrint class="inline-block w-5 h-5" />
          <h4>Create account</h4>
          <PawPrint class="inline-block w-5 h-5" />
        </div>

        <form @submit.prevent="createAccount" style="gap: 0.7rem;">
          <!-- Username input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="username" type="text" placeholder="Username" required aria-label="Username" />
          </div>
          <div v-if="formFieldsErrorDetailsObject.username" class="custom-error-message">
            {{ formFieldsErrorDetailsObject.username }}
          </div>

          <!-- Email input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="email" placeholder="Email" type="email" required aria-label="Email" />
          </div>
          <div v-if="formFieldsErrorDetailsObject.email" class="custom-error-message">
            {{ formFieldsErrorDetailsObject.email }}
          </div>

          <!-- Password input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="password" @input="validatePassword" :type="passwordFieldType" placeholder="Password" required
              id="password" aria-label="Password" />
            <button type="button" class="show-password-button" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>

          <div class="strong-password-note">
            <ul>
              <li :class="{ 'valid': passwordValidations.uppercase }">At least one uppercase</li>
              <li :class="{ 'valid': passwordValidations.lowercase }">At least one lowercase</li>
              <li :class="{ 'valid': passwordValidations.number }">At least one number</li>
              <li :class="{ 'valid': passwordValidations.special }">At least one special character (@$!%*?&amp;.-_)</li>
              <li :class="{ 'valid': passwordValidations.minLength }">Minimum 10 characters</li>
            </ul>
          </div>

          <!-- Confirm password input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="confirmPassword" placeholder="Confirm password" :type="passwordFieldType" required
              id="confirmPassword" aria-label="Confirm Password" />
            <button type="button" class="show-password-button" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <div v-if="formFieldsErrorDetailsObject.newPassword" class="custom-error-message">
            {{ formFieldsErrorDetailsObject.newPassword }}
          </div>

          <!-- Timezone select field -->
          <div class="auth-field cursor-pointer" @click="showModal = true">
            <span class="auth-field-input" :class="{ 'text-foreground/50': !selectedTimezone }">
              {{ selectedTimezone || 'Select Timezone' }}
            </span>
          </div>
          <div v-if="formFieldsErrorDetailsObject.timezone" class="custom-error-message">
            {{ formFieldsErrorDetailsObject.timezone }}
          </div>

          <TheTimezoneSelectorModal :isOpen="showModal" @update:isOpen="showModal = $event"
            @timezoneSelected="timezone => selectedTimezone = timezone" />

          <div class="flex flex-col gap-2">
            <button type="submit" class="action-button primary-action-button">Create Account</button>
            <button type="button" @click="goBack" class="action-button secondary-action-button">← Back</button>
          </div>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, computed } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import TheTimezoneSelectorModal from '@/components/TheTimezoneSelectorModal.vue';
import { PawPrint, Eye, EyeOff } from 'lucide-vue-next';
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
  const pwd = password.value;

  const allowedSpecialChars = /[@$!%*?&.\-_]/;
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
  if (
    !passwordValidations.value.uppercase ||
    !passwordValidations.value.lowercase ||
    !passwordValidations.value.number ||
    !passwordValidations.value.special ||
    !passwordValidations.value.minLength
  ) {
    formFieldsErrorDetailsObject.value.newPassword = 'Password does not meet the requirements.';
    setTimeout(() => {
      formFieldsErrorDetailsObject.value.newPassword = '';
    }, 3000);
    return;
  }

  if (password.value !== confirmPassword.value) {
    formFieldsErrorDetailsObject.value.newPassword = 'Passwords do not match';
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
      timezone: errorDetails?.timezone?.[0] || '',
    };
    errorMessage.value = message ? message : 'An error occurred. Please try again later.';
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