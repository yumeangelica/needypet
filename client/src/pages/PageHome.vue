<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Home</ion-title>
        <div slot="end" style="display: flex; align-items: center;">
          <span>Welcome, {{ userName }}!</span>
          <ion-button fill="clear" color="medium" @click="logout">Logout</ion-button>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { getAllUserPets } from '@/services/api';

const userName = ref(localStorage.getItem('userName') || 'Guest');
const pets = ref([]);

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('id');
  window.location.href = '/login';
};

onMounted(async () => {
  const petsData = await getAllUserPets();
  pets.value = petsData;
});
</script>

<style scoped>
ion-buttons span {
  margin-right: 1rem;
  color: #fff;
}

.pet-container {
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.pet-container h2 {
  margin-top: 0;
}
</style>
