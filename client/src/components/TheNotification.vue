<template>
  <div
    class="notification-container"
    :class="{ 'with-header': hasDesktopHeader }"
  >
    <div
      v-for="notification in sortedNotifications"
      :key="notification.id"
      :class="['notification', notification.type]"
    >
      {{ notification.type }}: {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();

const sortedNotifications = computed(() =>
  [...appStore.notifications].sort((a, b) => b.timestamp - a.timestamp)
);

defineProps<{
  hasDesktopHeader: boolean;
}>();
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 300px;
  z-index: 30000;
}

.notification-container.with-header {
  /* Adjust the top position when header is present */
  top: 70px; /* Adjust this value based on your header's height */
}

.notification {
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notification.success {
  border-left: 10px solid #4caf50;
}

.notification.error {
  border-left: 10px solid #f44336;
}

.notification.info {
  border-left: 10px solid #2196f3;
}
</style>
