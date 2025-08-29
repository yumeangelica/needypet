<template>
  <div class="app-footer copyright" :class="{ mobile: isMobile }">
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
.copyright {
  margin-top: auto;
  /* push to bottom within flex column container */
  padding-top: 30px;
  font-size: 0.7rem;
  text-align: center;
}

.copyright.mobile {
  /* Mobile: add space so it sits above the bottom tab bar */
  margin-bottom: 10px !important;
  /* Default Ionic tab bar height */
}

@media (max-width: 568px) {
  .copyright {
    font-size: 0.55rem;
  }
}
</style>