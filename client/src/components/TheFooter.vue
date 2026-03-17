<template>
  <div class="app-footer copyright mt-auto" :class="{ mobile: isMobile }">
    &copy; 2020 - {{ year }} yumeangelica.github.io. All Rights Reserved.
  </div>

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
  margin-bottom: 20px;
}

.copyright {
  margin-top: auto;
  /* push to bottom within flex column container */
  padding-top: 30px;
  font-size: 0.7rem;
  text-align: center;
}

.copyright.mobile {
  /* Mobile: add space so it sits above the bottom tab bar */
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 12px);
}

@media (max-width: 568px) {
  .copyright {
    font-size: 0.55rem;
  }
}
</style>