<template>
  <div class="app-page-root">
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container account-panel">
        <form class="change-password-form" @submit.prevent="submitForm">
          <h1 class="form-header text-[1.3rem] max-[568px]:text-[1.1rem]">Update my paw code 🐾</h1>

          <label class="form-label" for="changepw-current-password">Current paw code</label>
          <div class="form-field">
            <input id="changepw-current-password" class="form-field-input" v-model="currentPassword" :type="passwordFieldType" required
              placeholder="Your current paw code" :aria-invalid="errorDetailsObject.currentPassword ? true : undefined"
              :aria-describedby="errorDetailsObject.currentPassword ? 'changepw-current-error' : undefined" />
            <button type="button" class="show-password-button" :aria-label="passwordFieldType === 'password' ? 'Show password' : 'Hide password'" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" aria-hidden="true" />
              <EyeOff v-else class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div v-if="errorDetailsObject.currentPassword" id="changepw-current-error" class="custom-error-message" role="alert">
            {{ errorDetailsObject.currentPassword }}
          </div>

          <label class="form-label" for="changepw-new-password">New paw code</label>
          <div class="form-field">
            <input id="changepw-new-password" class="form-field-input" v-model="newPassword" @input="validatePassword" :type="passwordFieldType" required
              placeholder="Your new paw code" aria-describedby="changepw-requirements"
              :aria-invalid="errorDetailsObject.newPassword ? true : undefined" />
            <button type="button" class="show-password-button" :aria-label="passwordFieldType === 'password' ? 'Show password' : 'Hide password'" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" aria-hidden="true" />
              <EyeOff v-else class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div v-if="errorDetailsObject.newPassword" class="custom-error-message" role="alert">
            {{ errorDetailsObject.newPassword }}
          </div>

          <div class="strong-password-note">
            <ul id="changepw-requirements" aria-live="polite">
              <li :class="{ 'valid': passwordValidations.uppercase }">A big-cat letter (A-Z)</li>
              <li :class="{ 'valid': passwordValidations.lowercase }">A little-pup letter (a-z)</li>
              <li :class="{ 'valid': passwordValidations.number }">A number (0-9)</li>
              <li :class="{ 'valid': passwordValidations.special }">A special paw mark (!@#$%^&amp;*)</li>
              <li :class="{ 'valid': passwordValidations.minLength }">Nice and long (10+ characters)</li>
            </ul>
          </div>

          <div class="form-button-group">
            <button class="form-button primary" type="submit" aria-label="Change password">Save New Code</button>
            <button type="button" class="form-button secondary" @click="router.push({ name: 'profile' })">Cancel</button>
          </div>

          <div v-if="errorMessage" class="custom-error-message" role="alert">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import TheFooter from '@/components/TheFooter.vue';
import { validatePasswordRules } from '@/lib/passwordRules';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';

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
  passwordValidations.value = validatePasswordRules(newPassword.value);
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
    errorMessage.value = message ?? '';
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

<style scoped>
.change-password-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.change-password-form .form-header {
  margin-bottom: 0.85rem;
}

.change-password-form .form-label {
  margin-top: 0.4rem;
}

.change-password-form .strong-password-note {
  margin: 0.45rem 0 0.55rem;
}

.change-password-form .form-button-group {
  margin-top: 0.75rem;
}
</style>
