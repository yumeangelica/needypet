<template>
  <div class="min-h-screen flex flex-col">
    <!-- Desktop header -->
    <TheHeader v-if="showHeaderNavigation" />

    <!-- Main content -->
    <router-view />

    <!-- Mobile bottom navigation -->
    <TheMobileHeader v-if="showMobileNavigation" />

    <!-- Notifications -->
    <TheNotification :hasDesktopHeader="showHeaderNavigation" />
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/store/app';
import { useRoute } from 'vue-router';
import TheHeader from '@/components/TheHeader.vue';
import TheMobileHeader from '@/components/TheMobileHeader.vue';
import TheNotification from '@/components/TheNotification.vue';

const appStore = useAppStore();
const route = useRoute();

const showHeaderNavigation = computed(
  () =>
    !appStore.isMobile &&
    !['login', 'register', 'landing', 'request-password-reset', 'confirm'].includes(
      route.name as string
    )
);
const showMobileNavigation = computed(
  () =>
    appStore.isMobile &&
    !['login', 'register', 'landing', 'request-password-reset', 'confirm'].includes(
      route.name as string
    )
);

let cleanup: () => void;

onMounted(() => {
  // Start watching the screen size
  cleanup = appStore.watchScreenSize();
});

onUnmounted(() => {
  // Cleanup when the component is unmounted
  cleanup();
});
</script>