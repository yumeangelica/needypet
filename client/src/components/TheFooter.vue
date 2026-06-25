<template>
  <footer class="app-footer copyright mt-auto" :class="{ mobile: isMobile }">
    &copy; 2020 - {{ year }} yumeangelica.github.io. All Rights Reserved.
  </footer>

</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const year = new Date().getFullYear();
</script>

<style scoped>
.app-footer {
  margin-bottom: var(--space-stack);
}

.copyright {
  margin-top: auto;
  /* push to bottom within flex column container */
  padding-top: clamp(1.5rem, 4vw, 2rem);
  font-size: 0.8rem;
  line-height: 1.4;
  text-align: center;
  overflow-wrap: anywhere;
}

.copyright.mobile {
  /* Mobile: add space so it sits above the bottom tab bar */
  padding-bottom: calc(var(--mobile-nav-reserve) + var(--space-stack));
}

@media (max-width: 568px) {
  .copyright {
    font-size: 0.75rem;
  }
}
</style>
