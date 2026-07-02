<template>
  <div class="page-root">
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="login-register-container auth-panel auth-card auth-form-card">
        <TheLogoImage altText="NeedyPet logo" />

        <div class="auth-card-header paw-header-container">
          <PawPrint class="inline-block w-5 h-5" aria-hidden="true" />
          <h1 class="text-[1.15rem] max-[568px]:text-[0.9rem]">Lost your paw code?</h1>
          <PawPrint class="inline-block w-5 h-5" aria-hidden="true" />
        </div>

        <form class="auth-form" @submit.prevent="resetPassword">
          <div class="auth-field">
            <input class="auth-field-input" type="email" v-model="email" placeholder="Your email" aria-label="Email" />
          </div>

          <div class="auth-action-stack">
            <button type="submit" aria-label="Send reset link" class="action-button primary-action-button">Send Reset Link</button>
            <button type="button" @click="goBack" class="action-button secondary-action-button">← Back</button>
          </div>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { PawPrint } from '@lucide/vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import TheFooter from '@/components/TheFooter.vue';
import TheLogoImage from '@/components/TheLogoImage.vue';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';

const appStore = useAppStore();
const userStore = useUserStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();

const email = ref('');

const resetPassword = async () => {
  const isSuccess = await userStore.requestPasswordReset(email.value);
  if (!isSuccess) {
    appStore.addNotification("We couldn't send the reset link. Please try again.", 'error');
  } else {
    appStore.addNotification('Check your inbox! We sent you a reset link 📧', 'success');
  }
  goBack();
};

const goBack = () => {
  router.push({ name: 'login' });
  email.value = '';
};
</script>
