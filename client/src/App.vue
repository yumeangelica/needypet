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

  </ion-app>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/store/app';
import { useRoute } from 'vue-router';
import { IonRouterOutlet, IonTabs, IonApp } from '@ionic/vue';
import TheHeader from '@/components/TheHeader.vue';
import TheMobileHeader from '@/components/TheMobileHeader.vue';

const appStore = useAppStore();
const route = useRoute();
const isMobile = computed(() => appStore.isMobile);

// Desktop header should not be shown on login, register, and landing pages and not on mobile
const showHeaderNavigation = computed(() => !appStore.isMobile && !['login', 'register', 'landing', 'request-password-reset', 'confirm'].includes(route.name));
// Mobile navbar should not be shown on login, register, and landing pages and not on desktop
const showMobileNavigation = computed(() => appStore.isMobile && !['login', 'register', 'landing', 'request-password-reset', 'confirm'].includes(route.name));

// Update the screen size when the window is resized
function updateScreenSize() {
  appStore.updateScreenSize(window.innerWidth);
}

// Update the screen size when the component is mounted and when the window is resized
onMounted(() => {
  updateScreenSize();
  window.addEventListener('resize', updateScreenSize);
});

// Remove the event listener when the component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
});
</script>