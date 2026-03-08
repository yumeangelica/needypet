<template>
  <div class="empty-state">
    <ion-icon v-if="icon" :icon="icon" class="empty-state-icon"></ion-icon>
    <h3 class="empty-state-title">{{ title }}</h3>
    <p class="empty-state-message">{{ message }}</p>
    <ion-button v-if="actionLabel" class="custom-button" @click="$emit('action')">
      <ion-icon v-if="actionIcon" :icon="actionIcon" slot="start"></ion-icon>
      {{ actionLabel }}
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';

defineProps<{
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionIcon?: string;
}>();

defineEmits<{
  (e: 'action'): void;
}>();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-state-icon {
  font-size: 64px;
  color: var(--color-card-border);
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-state-title {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
}

.empty-state-message {
  margin: 0 0 20px 0;
  opacity: 0.8;
  max-width: 300px;
}
</style>
