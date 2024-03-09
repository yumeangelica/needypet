<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="content-wrapper">
        <div v-if="petStore.pets.length > 0">
          <h2>Pets that you own:</h2>
          <ThePetCard v-for="pet in ownPets" :key="pet.id" :pet="pet" />
        </div>
        <div v-if="petStore.pets.length > 0">
          <h2>Pets that you take care of:</h2>
          <ThePetCard v-for="pet in carerPets" :key="pet.id" :pet="pet" />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { ref } from 'vue';
import { usePetStore } from '@/store/pet';
import ThePetCard from '@/components/ThePetCard.vue';

const petStore = usePetStore();
const ownPets = ref(petStore.getOwnerPets());
const carerPets = ref(petStore.getCarerPets());

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


.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 60px; /* Lisätään ylimääräistä tilaa yläpalkin ja sisällön väliin */
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
