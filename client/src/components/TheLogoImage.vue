<template>
  <img :src="logoSrc" :alt="altText" class="logo" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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

// Swap the logo whenever the screen-size category changes.
// The global resize listener lives in App.vue, so we only react to isMobile here.
watch(isMobile, updateLogoSrc, { immediate: true });
</script>

<style scoped>
.logo {
  width: 90%;
  max-width: 250px;
  height: auto;
  margin: 0 auto;
  display: block;
}

</style>
