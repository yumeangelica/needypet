<template>
  <div class="loading-state">
    <ion-spinner :name="spinner" class="loading-spinner"></ion-spinner>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';

withDefaults(defineProps<{
  message?: string;
  spinner?: 'bubbles' | 'circles' | 'circular' | 'crescent' | 'dots' | 'lines' | 'lines-small';
}>(), {
  spinner: 'crescent',
});
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-spinner {
  color: var(--color-text-lilac);
  width: 40px;
  height: 40px;
}

.loading-message {
  margin-top: 12px;
  opacity: 0.8;
  font-size: 0.9rem;
}
</style>
