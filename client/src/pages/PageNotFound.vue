<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <h1 class="ion-text-center">Oops! This page doesn't exist.</h1>
        <p class="ion-text-center">Looks like you wandered off the trail. 🐾</p>
        <div class="ion-text-center" style="margin-top: 20px;">
          <ion-button class="action-button primary-action-button" @click="router.push({ name: 'home' })">Back to home</ion-button>
        </div>
      </div>
      <TheFooter />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { IonContent, IonPage, IonButton } from '@ionic/vue';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
</script>