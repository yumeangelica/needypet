<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">

        <div v-if="userEmailConfirmed === false || userEmailConfirmed === null">
          <div class="confirmation-message">
            <p>Your email is not confirmed yet. Please check your email for the confirmation link.</p>
          </div>
        </div>

        <div v-else>
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
            <div class="title-and-button-container">
              <h2 class="section-title">Your pets:</h2>
              <ion-button @click="router.push({ name: 'add-pet' })" class="custom-button">
                <ion-icon :icon="addCircleOutline"></ion-icon>
                Add Pet</ion-button>
            </div>
            <p class="ion-text-center">You don't have any pets yet.</p>
          </div>
        </div>
      </div>

      <TheFooter />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeMount, computed, Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import { addCircleOutline } from 'ionicons/icons';
import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/vue';
import ThePetCard from '@/components/ThePetCard.vue';
import { Pet } from '@/types/pet';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const route = useRoute();
const petStore = usePetStore();
const userStore = useUserStore();

const ownPets: Ref<Pet[]> = ref([]);
const carerPets: Ref<Pet[]> = ref([]);

const userEmailConfirmed: Ref<boolean> = ref(false);

// Update the pet lists from the store
const updatePetLists = async () => {
  if (petStore.pets.length === 0) {
    return;
  }
  ownPets.value = await petStore.getOwnerPets();
  carerPets.value = await petStore.getCarerPets();
};

// Load the pet data when the component is mounted
onBeforeMount(async () => {
  await fetchUserEmailConfirmed();
  await updatePetLists();
});

// Update the pet lists when the route changes
watch(() => route.params && petStore.pets, async () => {
  ownPets.value = await petStore.getOwnerPets();
  carerPets.value = await petStore.getCarerPets();
});

// Function to fetch user email confirmation status
const fetchUserEmailConfirmed = async () => {
  const user = await userStore.getUserById(userStore.id);
  userEmailConfirmed.value = user.emailConfirmed;
};

</script>


<style scoped>
/* Base layout */
.title-and-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.pets-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 8px 0;
  max-width: 100%;
}

.section-title {
  margin: 0;
  font-size: 1.3rem;
  padding: 6px 0;
}

</style>
