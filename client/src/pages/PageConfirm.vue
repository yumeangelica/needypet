<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <!-- Email confirmation -->
      <div v-if="confirmationType === 'email'">
        <div class="confirmation-container">
          <div class="confirmation-message">{{ confirmationMessage }}</div>
          <button v-if="showLoginButton" @click="goToLogin" class="action-button primary-action-button">
            Go to Login
          </button>
        </div>
      </div>

      <!-- Password reset -->
      <div v-else-if="confirmationType === 'password'">
        <div v-if="showForm" class="login-register-container">
          <TheLogoImage altText="NeedyPet logo" />

          <div class="paw-header-container">
            <PawPrint class="inline-block w-5 h-5" />
            <h4>Reset Password</h4>
            <PawPrint class="inline-block w-5 h-5" />
          </div>

          <div class="custom-valid-message text-center">{{ validMessage }}</div>

          <form @submit.prevent="resetPassword">
            <div class="auth-field">
              <input
                class="auth-field-input"
                type="password"
                v-model="newPassword"
                placeholder="Enter new password"
                aria-label="New Password"
              />
            </div>

            <div class="auth-field">
              <input
                class="auth-field-input"
                type="password"
                v-model="confirmPassword"
                placeholder="Confirm new password"
                aria-label="Confirm Password"
              />
            </div>

            <div class="flex flex-col gap-2">
              <button type="submit" class="action-button primary-action-button">Set Password</button>
              <button type="button" @click="goBack" class="action-button secondary-action-button">← Back</button>
            </div>

            <div v-if="errorMessage" class="custom-error-message">
              {{ errorMessage }}
            </div>
          </form>
        </div>

        <div v-else class="confirmation-container">
          <div class="confirmation-message">{{ confirmationMessage }}</div>
          <button @click="goToLogin" class="action-button primary-action-button">Go to Login</button>
        </div>
      </div>

      <!-- Invalid confirmation link -->
      <div v-else class="confirmation-container">
        <div class="confirmation-message">{{ confirmationMessage }}</div>
        <button v-if="showLoginButton" @click="goToLogin" class="action-button primary-action-button">
          Go to Login
        </button>
      </div>
    </div>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import { PawPrint } from 'lucide-vue-next';
import TheLogoImage from '@/components/TheLogoImage.vue';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const userStore = useUserStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();
const route = useRoute();

const newPassword = ref('');
const confirmPassword = ref('');
const validMessage = ref('');
const errorMessage = ref('');
const confirmationMessage = ref<string>('');
const showLoginButton = ref<boolean>(false);
const showForm = ref<boolean>(false);

const email = ref('');
const token = ref('');
const confirmationType = ref<string | null>(null);

onBeforeMount(async () => {
  const urlEmail = route.query.email as string | null;
  const urlToken = route.query.token as string | null;
  confirmationType.value = route.query.confirmationType as string | null;

  if (!urlEmail || !urlToken || !confirmationType.value) {
    confirmationMessage.value = 'Invalid confirmation link. Please try again.';
    showLoginButton.value = true;
    return;
  }

  try {
    if (confirmationType.value === 'email') {
      const isConfirmed = await userStore.confirmEmail(urlEmail, urlToken);
      if (isConfirmed) {
        confirmationMessage.value = 'Your email has been successfully confirmed. You can now log in.';
        showLoginButton.value = true;
      } else {
        confirmationMessage.value = 'Invalid or expired confirmation link. Please try again.';
        showLoginButton.value = true;
      }
    } else if (confirmationType.value === 'password') {
      const isValid = await userStore.verifyPasswordResetToken(urlEmail, urlToken);
      if (isValid) {
        showForm.value = true;
        email.value = urlEmail;
        token.value = urlToken;
      } else {
        confirmationMessage.value = 'Invalid or expired password reset link. Please try again.';
        showLoginButton.value = true;
      }
    }
  } catch (_error) {
    confirmationMessage.value = 'An error occurred. Please try again later.';
    showLoginButton.value = true;
  }
});

const resetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  try {
    const response = await userStore.passwordReset(email.value, token.value, newPassword.value);

    if (!response) {
      errorMessage.value = 'Failed to reset password. Try to send a new reset link';
      return;
    }

    validMessage.value = 'Password has been reset successfully';
    setTimeout(() => {
      validMessage.value = '';
      goBack();
    }, 3000);
  } catch (_error) {
    errorMessage.value = 'Failed to reset password. Try to send a new reset link';
  }
};

const goBack = () => {
  router.push({ name: 'login' });
  newPassword.value = '';
  confirmPassword.value = '';
};

const goToLogin = () => {
  router.push({ name: 'login' });
};
</script>

<style scoped>
.confirmation-container {
  padding: 20px;
  border-radius: 50px;
  background-color: var(--color-auth-bg);
  border: 1px solid var(--color-button-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.confirmation-message {
  margin-bottom: 20px;
  font-size: 1rem;
  color: var(--color-foreground);
}

@media (max-width: 568px) {
  .confirmation-container {
    margin-top: 10vh;
  }

  .confirmation-message {
    font-size: 0.85rem;
  }
}
</style>
