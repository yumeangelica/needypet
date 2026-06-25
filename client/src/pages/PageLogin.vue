<template>
  <div class="page-root">
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="login-register-container auth-card auth-form-card">
        <TheLogoImage altText="NeedyPet Logo" />

        <div class="auth-card-header paw-header-container">
          <PawPrint class="inline-block w-5 h-5" aria-hidden="true" />
          <h1 class="text-[1.15rem] max-[568px]:text-[0.9rem]">Login</h1>
          <PawPrint class="inline-block w-5 h-5" aria-hidden="true" />
        </div>

        <form class="auth-form" @submit.prevent="login">
          <div class="auth-field">
            <input class="auth-field-input" type="text" v-model="userName" placeholder="Enter your username" aria-label="Username" />
          </div>

          <div class="auth-field">
            <input class="auth-field-input" :type="passwordFieldType" v-model="password" placeholder="Enter your password" aria-label="Password" />
            <button type="button" class="show-password-button" :aria-label="passwordFieldType === 'password' ? 'Show password' : 'Hide password'" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" aria-hidden="true" />
              <EyeOff v-else class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div class="auth-action-row">
            <button type="submit" class="action-button primary-action-button auth-action-button">Log In</button>
            <button type="button" @click="goBack" class="action-button secondary-action-button auth-action-button">← Back</button>
          </div>

          <button type="button" @click="router.push({ name: 'request-password-reset' })" class="auth-secondary-link">
            Forgot Password
          </button>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, PawPrint } from '@lucide/vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import TheFooter from '@/components/TheFooter.vue';
import TheLogoImage from '@/components/TheLogoImage.vue';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const userName = ref('');
const password = ref('');

const router = useRouter();
const userStore = useUserStore();
const petStore = usePetStore();

const passwordFieldType = ref<'password' | 'text'>('password');

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const login = async () => {
  const { isSuccess, message } = await userStore.login(userName.value, password.value);

  if (isSuccess) {
    router.push({ name: 'home' });
    userName.value = '';
    password.value = '';
    await petStore.getAllPets();
    appStore.addNotification(message, 'success');
  } else {
    appStore.addNotification(message, 'error');
  }
};

const goBack = () => {
  router.push({ name: 'landing' });
  userName.value = '';
  password.value = '';
};
</script>
