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
import { computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useAppStore } from '@/store/app';
import { useRoute } from 'vue-router';
import { IonRouterOutlet, IonTabs } from '@ionic/vue';
// Lazy load the components for better performance
const IonApp = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonApp));
const TheHeader = defineAsyncComponent(() => import('@/components/TheHeader.vue'));
const TheMobileHeader = defineAsyncComponent(() => import('@/components/TheMobileHeader.vue'));

const appStore = useAppStore();
const route = useRoute();
const isMobile = computed(() => appStore.isMobile);


// Desktop header should not be shown on login, register, and landing pages and not on mobile
const showHeaderNavigation = computed(() => !appStore.isMobile && !['login', 'register', 'landing'].includes(route.name));
// Mobile navbar should not be shown on login, register, and landing pages and not on desktop
const showMobileNavigation = computed(() => appStore.isMobile && !['login', 'register', 'landing'].includes(route.name));

function updateScreenSize() {
  appStore.updateScreenSize(window.innerWidth);
}

onMounted(() => {
  updateScreenSize();
  window.addEventListener('resize', updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
});
</script>