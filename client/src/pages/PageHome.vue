<template>
  <div>
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <h1 class="sr-only">Home</h1>

      <div v-if="userEmailConfirmed === false">
        <div class="confirmation-message">
          <p>Let's confirm your email so you can start caring for your pets! 🐾 Check your inbox for the confirmation link.</p>
        </div>
      </div>

      <div v-else-if="userEmailConfirmed === true">
        <TheLoadingSpinner v-if="isLoading" message="Fetching your furry friends..." />

        <div v-else-if="ownPets.length > 0 || carerPets.length > 0" class="pets-container">
          <div v-if="ownPets.length > 0">
            <div class="title-and-button-container">
              <h2 class="section-title">My Furry Friends</h2>
              <button @click="router.push({ name: 'add-pet' })" aria-label="Add pet" class="custom-button">
                <CirclePlus class="inline-block w-4 h-4 mr-1" aria-hidden="true" />
                Welcome a Pet
              </button>
            </div>

            <div class="cards-container">
              <ThePetCard v-for="pet in ownPets" :key="pet.id" :pet="pet" />
            </div>
          </div>

          <div v-if="carerPets.length > 0">
            <h2 class="section-title">Pets I Help Care For</h2>
            <div class="cards-container">
              <ThePetCard v-for="pet in carerPets" :key="pet.id" :pet="pet" />
            </div>
          </div>
        </div>

        <div v-else>
          <div class="title-and-button-container">
            <h2 class="section-title">My Furry Friends</h2>
          </div>
          <TheEmptyState :icon="PawPrint" title="No pets yet" message="Welcome your first furry friend to get started! 🐾"
            actionLabel="Welcome a Pet" :actionIcon="CirclePlus" @action="router.push({ name: 'add-pet' })" />
        </div>
      </div>

      <TheLoadingSpinner v-else message="Just a moment..." />

    </div>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { CirclePlus, PawPrint } from '@lucide/vue';
import { computed, onBeforeMount, type Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TheEmptyState from '@/components/TheEmptyState.vue';
import TheFooter from '@/components/TheFooter.vue';
import TheLoadingSpinner from '@/components/TheLoadingSpinner.vue';
import ThePetCard from '@/components/ThePetCard.vue';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import type { Pet } from '@/types/pet';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const route = useRoute();
const petStore = usePetStore();
const userStore = useUserStore();

const ownPets: Ref<Pet[]> = ref([]);
const carerPets: Ref<Pet[]> = ref([]);
const isLoading = ref(true);

const userEmailConfirmed: Ref<boolean | null> = ref(null);

const updatePetLists = () => {
  if (petStore.pets.length === 0) {
    return;
  }
  ownPets.value = petStore.getOwnerPets();
  carerPets.value = petStore.getCarerPets();
};

onBeforeMount(async () => {
  await fetchUserEmailConfirmed();
  updatePetLists();
  isLoading.value = false;
});

watch(
  () => route.params && petStore.pets,
  () => {
    ownPets.value = petStore.getOwnerPets();
    carerPets.value = petStore.getCarerPets();
  },
);

const fetchUserEmailConfirmed = async () => {
  if (!userStore.id) return;
  const user = await userStore.getUserById(userStore.id);
  if (user) {
    userEmailConfirmed.value = user.emailConfirmed;
  }
};
</script>

<style scoped>
.title-and-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-stack);
  margin: 10px 0 var(--space-stack);
  text-align: center;
}

.pets-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 3vw, 1.5rem);
  width: 100%;
  padding: clamp(0.5rem, 2vw, 1rem);
  box-sizing: border-box;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.75rem, 3vw, 1.25rem);
  justify-content: center;
  margin: 8px 0 0;
  max-width: 100%;
}

.section-title {
  margin: 0;
  font-size: 1.3rem;
  padding: 6px 0;
  line-height: 1.25;
}
</style>
