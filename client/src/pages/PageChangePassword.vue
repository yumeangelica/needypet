<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container">
        <form @submit.prevent="submitForm">
          <h3>Change Password:</h3>

          <!-- Current Password input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="currentPassword" :type="passwordFieldType" required placeholder="Current Password" />
            <button type="button" class="show-password-button" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <div v-if="errorDetailsObject.currentPassword" class="custom-error-message">
            {{ errorDetailsObject.currentPassword }}
          </div>

          <!-- New Password input field -->
          <div class="auth-field">
            <input class="auth-field-input" v-model="newPassword" @input="validatePassword" :type="passwordFieldType" required
              placeholder="New Password" />
            <button type="button" class="show-password-button" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <div v-if="errorDetailsObject.newPassword" class="custom-error-message">
            {{ errorDetailsObject.newPassword }}
          </div>

          <div class="strong-password-note">
            <ul>
              <li :class="{ 'valid': passwordValidations.uppercase }">At least one uppercase</li>
              <li :class="{ 'valid': passwordValidations.lowercase }">At least one lowercase</li>
              <li :class="{ 'valid': passwordValidations.number }">At least one number</li>
              <li :class="{ 'valid': passwordValidations.special }">At least one special character</li>
              <li :class="{ 'valid': passwordValidations.minLength }">Minimum 10 characters</li>
            </ul>
          </div>

          <div class="form-button-group">
            <button class="form-button primary" type="submit">Change Password</button>
            <button type="button" class="form-button secondary" @click="router.push({ name: 'profile' })">Cancel</button>
          </div>

          <div v-if="errorMessage" class="custom-error-message">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { Eye, EyeOff } from 'lucide-vue-next';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const userStore = useUserStore();
const router = useRouter();

const errorMessage = ref('');
const errorDetailsObject = ref({
  currentPassword: '',
  newPassword: '',
});

const currentPassword = ref('');
const newPassword = ref('');
const passwordFieldType = ref<'password' | 'text'>('password');

const passwordValidations = ref({
  uppercase: false,
  lowercase: false,
  number: false,
  special: false,
  minLength: false,
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
    newPassword: newPassword.value,
  });

  if (isSuccess) {
    currentPassword.value = '';
    newPassword.value = '';
    router.push({ name: 'profile', query: { passwordChangedSuccessfully: 'true' } });
  } else {
    errorDetailsObject.value = {
      currentPassword: errorDetails?.currentPassword?.[0] || '',
      newPassword: errorDetails?.newPassword?.[0] || '',
    };
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = '';
      errorDetailsObject.value = {
        currentPassword: '',
        newPassword: '',
      };
    }, 5000);
  }
};
</script>
