<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="login-register-container">
          <TheLogoImage altText="NeedyPet logo" />

          <div class="paw-header-container">
            <ion-icon :icon="pawOutline"></ion-icon>
            <h4>Forgot Password</h4>
            <ion-icon :icon="pawOutline"></ion-icon>
          </div>

          <form @submit.prevent="resetPassword">
            <ion-item class="login-register-field-item">
              <ion-input class="login-register-field-input" type="email" v-model="email" placeholder="Enter your email" aria-label="Email"></ion-input>
            </ion-item>

            <ion-buttons>
              <ion-button type="submit" expand="block" class="action-button primary-action-button">Reset Password</ion-button>
              <ion-button @click="goBack" expand="block" class="action-button secondary-action-button">Go Back</ion-button>
            </ion-buttons>

          </form>
        </div>

      </div>
      <TheFooter />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonPage, IonButtons } from '@ionic/vue';
import { pawOutline } from 'ionicons/icons';
import TheLogoImage from '@/components/TheLogoImage.vue';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const userStore = useUserStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();

const email = ref('');

const resetPassword = async () => {

  const isSuccess = await userStore.requestPasswordReset(email.value);
  if (!isSuccess) {
    appStore.addNotification('Failed to send password reset link, please try again later', 'error');
  } else {
    appStore.addNotification('Please check your email for the password reset link', 'success');
  }
  goBack();
};

const goBack = () => {
  router.push({ name: 'login' });
  email.value = '';
};


</script>