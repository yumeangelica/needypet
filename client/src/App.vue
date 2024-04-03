<template>
  <ion-app>

      <TheHeader v-if="!isMobile"/>
      <ion-router-outlet v-if="!isMobile"/>

      <!-- Using ion-tabs for mobile navigation -->
      <ion-tabs v-else>
        <!-- Content -->
        <ion-router-outlet></ion-router-outlet>
        <!-- Mobile navigation -->
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
