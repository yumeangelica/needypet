<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="login-register-container">
        <TheLogoImage altText="NeedyPet logo" />

        <div class="paw-header-container">
          <PawPrint class="inline-block w-5 h-5" />
          <h4>Login</h4>
          <PawPrint class="inline-block w-5 h-5" />
        </div>

        <form @submit.prevent="login">
          <div class="auth-field">
            <input
              class="auth-field-input"
              type="text"
              v-model="userName"
              placeholder="Enter your username"
              aria-label="Username"
            />
          </div>

          <div class="auth-field">
            <input
              class="auth-field-input"
              :type="passwordFieldType"
              v-model="password"
              placeholder="Enter your password"
              aria-label="Password"
            />
            <button type="button" class="show-password-button" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>

          <div class="flex flex-col gap-2">
            <button type="submit" class="action-button primary-action-button">Log In</button>
            <button type="button" @click="goBack" class="action-button secondary-action-button">← Back</button>
          </div>

          <button type="button" @click="router.push({ name: 'request-password-reset' })"
            class="action-button secondary-action-button mt-2">
            Forgot Password
          </button>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { usePetStore } from '@/store/pet';
import { useAppStore } from '@/store/app';
import { PawPrint, Eye, EyeOff } from 'lucide-vue-next';
import TheLogoImage from '@/components/TheLogoImage.vue';
import TheFooter from '@/components/TheFooter.vue';

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
