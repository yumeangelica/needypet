<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <h1 class="ion-text-center">Page Not Found</h1>
        <p class="ion-text-center">Sorry, the page you are looking for does not exist.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useAppStore } from '@/store/app';

// Lazy load the components for better performance
const IonPage = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonPage));
const IonContent = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonContent));

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
</script>