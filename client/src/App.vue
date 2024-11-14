<template>
  <ion-app>
    <!-- Desktop header and content -->
    <TheHeader v-if="showHeaderNavigation" />
    <ion-router-outlet v-if="!isMobile" :animated="false"></ion-router-outlet>

    <!-- Using ion-tabs for mobile navigation -->
    <ion-tabs v-if="isMobile">
      <!-- Mobile content -->
      <ion-router-outlet :animated="false"></ion-router-outlet>
      <TheMobileHeader v-if="showMobileNavigation" />
    </ion-tabs>

    <!-- Include the TheNotification component and pass the hasHeader prop -->
    <TheNotification :hasDesktopHeader="showHeaderNavigation" />
  </ion-app>
</template>


<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/store/app';
import { useRoute } from 'vue-router';
import { IonRouterOutlet, IonTabs, IonApp } from '@ionic/vue';
import TheHeader from '@/components/TheHeader.vue';
import TheMobileHeader from '@/components/TheMobileHeader.vue';
import TheNotification from '@/components/TheNotification.vue';

const appStore = useAppStore();
const route = useRoute();
const isMobile = computed(() => appStore.isMobile);

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