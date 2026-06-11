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
import { useRoute } from 'vue-router';
import TheHeader from '@/components/TheHeader.vue';
import TheMobileHeader from '@/components/TheMobileHeader.vue';
import TheNotification from '@/components/TheNotification.vue';
import { PUBLIC_ROUTE_NAMES } from '@/router/index';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
const route = useRoute();

// Navigation is hidden on public (auth) pages
const isPublicRoute = computed(() =>
  (PUBLIC_ROUTE_NAMES as readonly string[]).includes(route.name as string),
);

const showHeaderNavigation = computed(() => !appStore.isMobile && !isPublicRoute.value);
const showMobileNavigation = computed(() => appStore.isMobile && !isPublicRoute.value);

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