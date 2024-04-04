<template>
  <ion-app>

    <!-- Desktop header and content-->
    <TheHeader v-if="!isMobile" />
    <ion-router-outlet :animated="false" v-if="!isMobile" />

    <!-- Using ion-tabs for mobile navigation -->
    <ion-tabs v-else>
      <!-- Mobile content and header in different order -->
      <ion-router-outlet :animated="false"></ion-router-outlet>
      <TheMobileHeader />
    </ion-tabs>

  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet, IonTabs } from '@ionic/vue';
import { computed, onMounted, onUnmounted } from 'vue';
import TheHeader from '@/components/TheHeader.vue';
import TheMobileHeader from '@/components/TheMobileHeader.vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

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