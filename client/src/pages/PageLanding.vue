<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="login-register-container">
          <img :src="needypet_logo" alt="Needypet Logo" class="logo" />

          <h4 class="ion-text-center">Loving care for your Needy Pet!</h4>

          <div class="custom-valid-message ion-text-center" v-if="validMessage">
            {{ validMessage }}
          </div>
          <!-- Global button styling for action buttons -->
          <ion-button @click="router.push({ name: 'login' });" expand="block" class="action-button primary-action-button">Login</ion-button>
          <ion-button @click="router.push({ name: 'register' })" expand="block" class="action-button secondary-action-button">Create
            Account</ion-button>
        </div>
        <div class="copyright">&copy; 2020 - {{ year }} yumeangelica.github.io. All Rights Reserved.</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/store/app';
import { IonButton, IonContent, IonPage } from '@ionic/vue';
import needypet_logo from '@/assets/images/needypet_logo.webp';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const route = useRoute();

const validMessage = ref('');

const router = useRouter();

const year = new Date().getFullYear();

onBeforeMount(() => {
  
  if (route.query.userLoggedOut === 'true') {
    validMessage.value = 'You have been successfully logged out.';
    setTimeout(() => {
      validMessage.value = '';
    }, 5000);
  }

  if (route.query.userDeleted === 'true') {
    validMessage.value = 'Your account has been successfully deleted.';
    setTimeout(() => {
      validMessage.value = '';
    }, 5000);
  }
});


</script>

<style>
  .copyright {
    margin-top: 30px;
    font-size: 0.7rem;
    text-align: center;
  }

  @media (max-width: 568px) {
    .copyright {
      font-size: 0.55rem;
    }
  }
</style>