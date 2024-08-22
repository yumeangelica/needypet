<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <h1 class="ion-text-center">Page Not Found</h1>
        <p class="ion-text-center">Sorry, the page you are looking for does not exist.</p>
      </div>
      <TheFooter />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/app';
import { IonContent, IonPage } from '@ionic/vue';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
</script>