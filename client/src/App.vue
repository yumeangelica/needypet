<template>
  <ion-app>
    <ion-page>
      <TheHeader v-if="!isMobile"/>
      <ion-router-outlet v-if="!isMobile" />

      <ion-tabs v-if="isMobile">
        <ion-router-outlet />
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="home" href="/">
            <ion-icon aria-hidden="true" :icon="pawOutline" class="homebutton"/>
            <ion-label class="homebutton">Home</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>

    </ion-page>
  </ion-app>
</template>

<script setup>
import { IonApp, IonPage, IonRouterOutlet, IonTabs, IonTabBar, IonIcon, IonLabel, IonTabButton } from '@ionic/vue';
import { computed, onMounted, onUnmounted } from 'vue';
import TheHeader from '@/components/TheHeader.vue';
import { useAppStore } from '@/store/app';
import { pawOutline } from 'ionicons/icons';
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

<style>
.homebutton {
  color: #f364f6;
}
</style>