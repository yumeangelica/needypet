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
      <div class="pet-container" v-for="pet in pets" :key="pet.id">
        <h2>{{ pet.name }}</h2>
        <p><strong>Breed:</strong> {{ pet.breed }}</p>
        <p><strong>Description:</strong> {{ pet.description }}</p>
        <p><strong>Birthday:</strong> {{ pet.birthday }}</p>
        <p><strong>Owner:</strong> {{ pet.owner }}</p>
        <p><strong>Care Takers:</strong> {{ pet.careTakers.join(', ') }}</p>
        <p><strong>Needs:</strong> {{ pet.needs.join(', ') }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { getAllPets } from '@/services/api';

const userName = ref(localStorage.getItem('userName') || 'Guest');
const pets = ref([]);

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('id');
  window.location.href = '/login';
};

onMounted(async () => {
  const petsData = await getAllPets();
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
