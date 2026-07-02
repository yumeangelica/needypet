<template>
  <img :src="logoSrc" :alt="altText" class="logo" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import logoDesktopSrc from '@/assets/images/needypet_logo_desktop_1024.webp';
import logoMobileSrc from '@/assets/images/needypet_logo_mobile_512.webp';
import { useAppStore } from '@/store/app';

// Props for the component
defineProps<{
  altText?: string;
}>();

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const logoSrc = computed(() => (isMobile.value ? logoMobileSrc : logoDesktopSrc));
</script>

<style scoped>
.logo {
  width: 90%;
  max-width: 250px;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  margin: 0 auto;
  display: block;
  flex: 0 0 auto;
}

</style>
