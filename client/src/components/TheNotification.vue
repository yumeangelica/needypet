<template>
  <div class="notification-container" :class="{ 'with-header': hasDesktopHeader }" role="region" aria-label="Notifications">
    <div v-for="notification in sortedNotifications" :key="notification.id" :class="['notification', notification.type]"
      :role="notification.type === 'error' ? 'alert' : 'status'"
      :aria-live="notification.type === 'error' ? 'assertive' : 'polite'">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();

const sortedNotifications = computed(() =>
  [...appStore.notifications].sort((a, b) => b.timestamp - a.timestamp),
);

defineProps<{
  hasDesktopHeader: boolean;
}>();
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: calc(10px + env(safe-area-inset-top, 0px));
  right: 12px;
  width: min(340px, calc(100vw - 24px));
  z-index: 30000;
  pointer-events: none;
}

.notification-container.with-header {
  /* Offset when desktop header is present */
  top: calc(var(--header-height) + 10px);
}

.notification {
  background-color: #fff;
  padding: 14px 16px;
  margin-bottom: 12px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  border-left: 10px solid transparent;
  line-height: 1.4;
  overflow-wrap: anywhere;
  pointer-events: auto;
  /* base width/style for accent bar */
}

/* Accents */
.notification.success {
  border-left-color: var(--color-status-success);
}

.notification.error {
  border-left-color: var(--color-status-error);
}

.notification.info {
  border-left-color: var(--color-status-info);
}

@media (max-width: 568px) {
  .notification-container {
    left: 12px;
    right: 12px;
    width: auto;
  }

  .notification {
    padding: 12px 14px;
  }
}
</style>
