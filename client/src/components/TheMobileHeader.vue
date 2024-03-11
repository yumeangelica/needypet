<template>
  <ion-tab-bar slot="bottom" v-if="!isLoginPage">
    <ion-tab-button tab="home" href="/">
      <ion-icon aria-hidden="true" :icon="pawOutline" class="homebutton" />
      <ion-label class="homebutton">Home</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</template>

<script setup>
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { pawOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const isLoginPage = computed(() => route.name === 'login');

</script>

<style scoped>
.homebutton {
  color: #f364f6;
}
</style>