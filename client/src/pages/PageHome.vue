<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">

      <div v-if="userEmailConfirmed === false">
        <div class="confirmation-message">
          <p>Please verify your email to get started. Check your inbox for a confirmation link.</p>
        </div>
      </div>

      <div v-else-if="userEmailConfirmed === true">
        <TheLoadingSpinner v-if="isLoading" message="Loading your pets..." />

        <div v-else-if="ownPets.length > 0 || carerPets.length > 0" class="pets-container">
          <div v-if="ownPets.length > 0">
            <div class="title-and-button-container">
              <h2 class="section-title">My pets</h2>
              <button @click="router.push({ name: 'add-pet' })" class="custom-button">
                <CirclePlus class="inline-block w-4 h-4 mr-1" />
                Add Pet
              </button>
            </div>

            <div class="cards-container">
              <ThePetCard v-for="pet in ownPets" :key="pet.id" :pet="pet" />
            </div>
          </div>

          <div v-if="carerPets.length > 0">
            <h2 class="section-title">Shared With Me</h2>
            <div class="cards-container">
              <ThePetCard v-for="pet in carerPets" :key="pet.id" :pet="pet" />
            </div>
          </div>
        </div>

        <div v-else>
          <div class="title-and-button-container">
            <h2 class="section-title">My pets</h2>
          </div>
          <TheEmptyState icon="pawOutline" title="No pets yet" message="Add your first pet to get started!" actionLabel="Add Pet"
            actionIcon="addCircleOutline" @action="router.push({ name: 'add-pet' })" />
        </div>
      </div>

      <TheLoadingSpinner v-else message="Loading..." />

    </div>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeMount, computed, Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import { CirclePlus } from 'lucide-vue-next';
import ThePetCard from '@/components/ThePetCard.vue';
import TheEmptyState from '@/components/TheEmptyState.vue';
import TheLoadingSpinner from '@/components/TheLoadingSpinner.vue';
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
const isLoading = ref(true);

const userEmailConfirmed: Ref<boolean | null> = ref(null);

const updatePetLists = async () => {
  if (petStore.pets.length === 0) {
    return;
  }
  ownPets.value = await petStore.getOwnerPets();
  carerPets.value = await petStore.getCarerPets();
};

onBeforeMount(async () => {
  await fetchUserEmailConfirmed();
  await updatePetLists();
  isLoading.value = false;
});

watch(() => route.params && petStore.pets, async () => {
  ownPets.value = await petStore.getOwnerPets();
  carerPets.value = await petStore.getCarerPets();
});

const fetchUserEmailConfirmed = async () => {
  const user = await userStore.getUserById(userStore.id);
  userEmailConfirmed.value = user.emailConfirmed;
};
</script>

<style scoped>
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