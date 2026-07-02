<template>
  <div class="app-page-root">
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="confirmation-message not-found-card">
        <h1>Oops! This page doesn't exist.</h1>
        <p>Looks like you wandered off the trail. 🐾</p>
        <button class="action-button primary-action-button not-found-action" @click="router.push({ name: 'home' })">
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
import TheFooter from '@/components/TheFooter.vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
</script>

<style scoped>
.not-found-card {
  width: min(100%, 520px);
  margin-right: auto;
  margin-left: auto;
}

.not-found-card h1 {
  margin-top: 0;
}

.not-found-action {
  display: inline-flex;
  width: auto;
  min-width: 12rem;
}
</style>
