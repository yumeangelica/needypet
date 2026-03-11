<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="login-register-container">
        <TheLogoImage altText="Needypet Logo" />

        <h4 class="text-center">
          <PawPrint class="inline-block w-5 h-5" />
          All your pet's needs, one place
          <PawPrint class="inline-block w-5 h-5" />
        </h4>

        <button @click="router.push({ name: 'login' })" class="action-button primary-action-button">
          Login
        </button>
        <button @click="router.push({ name: 'register' })" class="action-button secondary-action-button">
          Create Account
        </button>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { PawPrint } from 'lucide-vue-next';
import TheLogoImage from '@/components/TheLogoImage.vue';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();
</script>
