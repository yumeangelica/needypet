<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <h1 class="text-center">Oops! This page doesn't exist.</h1>
      <p class="text-center">Looks like you wandered off the trail. 🐾</p>
      <div class="text-center mt-5">
        <button class="action-button primary-action-button inline-block w-auto" @click="router.push({ name: 'home' })">
          Back to home
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
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
</script>
