<template>
  <img :src="logoSrc" :alt="altText" class="logo" />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/store/app';

// Props for the component
defineProps<{
  altText?: string;
}>();

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const logoSrc = ref('');

// Function to update the logo source based on screen size
const updateLogoSrc = async () => {
  logoSrc.value = isMobile.value
    ? (await import('@/assets/images/needypet_logo_mobile_512.webp')).default
    : (await import('@/assets/images/needypet_logo_desktop_1024.webp')).default;
};

onMounted(() => {
  // Initialize the logo based on current screen size
  updateLogoSrc();

  // Listen for screen size changes and update the logo
  const cleanup = appStore.watchScreenSize();

  // Cleanup when the component is unmounted
  onUnmounted(() => {
    cleanup();
  });
});
</script>

<style scoped>
  .logo {
    width: 100%;
    height: auto;
  }
</style>
