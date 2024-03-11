<template>
  <ion-app>
    <ion-page>
      <TheHeader v-if="!isMobile"/>
      <ion-router-outlet />

      <ion-tabs v-if="isMobile">
        <ion-router-outlet />
        <TheMobileHeader />
      </ion-tabs>

    </ion-page>
  </ion-app>
</template>

<script setup>
import { IonApp, IonPage, IonRouterOutlet, IonTabs } from '@ionic/vue';
import { computed, onMounted, onUnmounted } from 'vue';
import TheHeader from '@/components/TheHeader.vue';
import { useAppStore } from '@/store/app';
import TheMobileHeader from '@/components/TheMobileHeader.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);


async function updateScreenSize() {
  appStore.updateScreenSize(window.innerWidth);
}

onMounted(async () => {
  updateScreenSize();
  window.addEventListener('resize', updateScreenSize);
});


onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
});

</script>

<style scoped>

</style>