<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
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

        <div v-if="ownPets.length === 0 && carerPets.length === 0">
          <p class="ion-text-center">You don't have any pets yet.</p>
        </div>

      </div>

      <div class="add-pet-button-container">
        <ion-button @click="goToAddPet" class="custom-button">Add Pet</ion-button>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import { ref, watch, onBeforeMount, computed } from 'vue';
import { usePetStore } from '@/store/pet';
import { useRouter } from 'vue-router';
import ThePetCard from '@/components/ThePetCard.vue';

import { useAppStore } from '@/store/app';
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();
const petStore = usePetStore();
const ownPets = ref([]);
const carerPets = ref([]);

const updatePetLists = async () => {
  if (petStore.pets.length === 0) {
    return;
  }
  ownPets.value = await petStore.getOwnerPets();
  carerPets.value = await petStore.getCarerPets();
  console.log('ownPets', ownPets.value);
  console.log('carerPets', carerPets.value);
};

onBeforeMount(updatePetLists);

watch(() => petStore.pets, updatePetLists, { deep: true });

const goToAddPet = () => {
  router.push({ name: 'add-pet' });
};

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

.add-pet-button-container {
  display: flex;
  justify-content: end;
  margin-bottom: 40px;
  margin-right: 20px;
}
</style>
