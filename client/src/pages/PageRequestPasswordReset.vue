<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="login-register-container">
        <TheLogoImage altText="NeedyPet logo" />

        <div class="paw-header-container">
          <PawPrint class="inline-block w-5 h-5" />
          <h4>Forgot Password</h4>
          <PawPrint class="inline-block w-5 h-5" />
        </div>

        <form @submit.prevent="resetPassword">
          <div class="auth-field">
            <input class="auth-field-input" type="email" v-model="email" placeholder="Enter your email" aria-label="Email" />
          </div>

          <div class="flex flex-col gap-2">
            <button type="submit" class="action-button primary-action-button">Reset Password</button>
            <button type="button" @click="goBack" class="action-button secondary-action-button">← Back</button>
          </div>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import { PawPrint } from 'lucide-vue-next';
import TheLogoImage from '@/components/TheLogoImage.vue';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const userStore = useUserStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();

const email = ref('');

const resetPassword = async () => {
  const isSuccess = await userStore.requestPasswordReset(email.value);
  if (!isSuccess) {
    appStore.addNotification('Failed to send password reset link, please try again later', 'error');
  } else {
    appStore.addNotification('Please check your email for the password reset link', 'success');
  }
  goBack();
};

const goBack = () => {
  router.push({ name: 'login' });
  email.value = '';
};
</script>
