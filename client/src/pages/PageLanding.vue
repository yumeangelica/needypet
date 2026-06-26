<template>
  <div class="page-root">
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="login-register-container landing-card">
        <h1 class="sr-only">NeedyPet</h1>
        <TheLogoImage altText="NeedyPet Logo" />

        <h4 class="text-center paw-header-container">
          <PawPrint class="inline-block w-5 h-5" aria-hidden="true" />
          All your pet's needs, one place
          <PawPrint class="inline-block w-5 h-5" aria-hidden="true" />
        </h4>

        <p class="landing-intro">First visit or coming back? Pick your paw-th 🐾</p>

        <button @click="router.push({ name: 'login' })" aria-label="Log in to an existing account"
          class="action-button primary-action-button landing-action-button">
          Welcome Back
          <span class="landing-action-hint">I already have an account</span>
        </button>
        <button @click="router.push({ name: 'register' })" aria-label="Create a new account"
          class="action-button secondary-action-button landing-action-button">
          Join the Pack
          <span class="landing-action-hint">I'm new, make an account</span>
        </button>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { PawPrint } from '@lucide/vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import TheFooter from '@/components/TheFooter.vue';
import TheLogoImage from '@/components/TheLogoImage.vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();
</script>
