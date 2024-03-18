<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="content-wrapper">
        <div v-if="ownPets.length > 0">
          <h2>Pets that you own:</h2>
          <ThePetCard v-for="pet in ownPets" :key="pet.id" :pet="pet" />
        </div>
        <div v-if="carerPets.length > 0">
          <h2>Pets that you take care of:</h2>
          <ThePetCard v-for="pet in carerPets" :key="pet.id" :pet="pet" />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { ref, watch, onMounted } from 'vue';
import { usePetStore } from '@/store/pet';
import ThePetCard from '@/components/ThePetCard.vue';

const petStore = usePetStore();

const ownPets = ref([]);
const carerPets = ref([]);

// Fetch the filtered pets from the store
const updatePetLists = async () => {
  if (petStore.pets.length === 0) {
    return;
  }
  ownPets.value = await petStore.getOwnerPets();
  carerPets.value = await petStore.getCarerPets();
};

// Run the update function when the component is mounted
onMounted(updatePetLists);

// Run the update function when the pets in the store change
watch(() => petStore.pets, updatePetLists);
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

.pet-container {
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.pet-container h2 {
  margin-top: 0;
}
</style>
