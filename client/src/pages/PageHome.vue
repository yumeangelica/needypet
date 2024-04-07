<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="pets-container">

          <div v-if="ownPets.length > 0">

            <div class="title-and-button-container">
              <h2 class="section-title">Your pets:</h2>
              <ion-button @click="router.push({ name: 'add-pet' })" class="custom-button">
                <ion-icon :icon="addCircleOutline"></ion-icon>
                Add Pet</ion-button>
            </div>

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

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { ref, watch, onBeforeMount, computed } from 'vue';
import { usePetStore } from '@/store/pet';
import { useRouter } from 'vue-router';
import ThePetCard from '@/components/ThePetCard.vue';
import { useAppStore } from '@/store/app';
import { addCircleOutline } from 'ionicons/icons';

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
};

onBeforeMount(updatePetLists);

watch(() => petStore.pets, updatePetLists, { deep: true });


</script>



<style scoped>

ion-icon {
  margin-right: 5px;

}

.title-and-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

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
  margin: 0;
  font-size: 1.5rem;
  padding: 10px 0;
}
</style>
