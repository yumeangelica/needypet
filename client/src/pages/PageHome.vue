<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="content-wrapper">
        <div class="pets-container">
          <div v-if="ownPets.length > 0">
            <h2 class="section-title">Your pets:</h2>
            <div class="cards-container">
              <ThePetCard v-for="pet in ownPets" :key="pet.id" :pet="pet" />
            </div>
          </div>
          <div v-if="carerPets.length > 0">
            <h2 class="section-title">Pets to take care of:</h2>
            <div class="cards-container">
              <ThePetCard v-for="pet in carerPets" :key="pet.id" :pet="pet" />
            </div>
          </div>
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

const updatePetLists = async () => {
  if (petStore.pets.length === 0) {
    return;
  }
  ownPets.value = await petStore.getOwnerPets();
  carerPets.value = await petStore.getCarerPets();
};

onMounted(updatePetLists);
watch(() => petStore.pets, updatePetLists);
</script>

<style scoped>
.pets-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.section-title {
  width: 100%;
  text-align: center;
  font-size: 1.5rem;
  padding: 10px 0;
  margin-bottom: 20px;
  margin-top: 40px;
}

.section-title:first-of-type {
  margin-top: 0;
}
</style>
