<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="edit-pet-container">
          <form @submit.prevent="confirmUpdatePet" class="edit-pet-form">
            <div>
              <ion-label>Name:</ion-label>
              <ion-item class="custom-input">
                <ion-input aria-label="Name" v-model="existingPetObject.name" required placeholder="Enter pet's name"></ion-input>
              </ion-item>
            </div>

            <div>
              <ion-label>Breed:</ion-label>
              <ion-item class="custom-input">
                <ion-input aria-label="Breed" v-model="existingPetObject.breed" placeholder="Enter pet's breed"></ion-input>
              </ion-item>
            </div>

            <div>
              <ion-label>Species:</ion-label>
              <ion-item class="custom-input">
                <ion-input aria-label="Species" v-model="existingPetObject.species" placeholder="Enter pet's species"></ion-input>
              </ion-item>
            </div>

            <div>
              <ion-label>Description</ion-label>
              <ion-item class="custom-input">
                <ion-textarea aria-label="Description" v-model="existingPetObject.description" placeholder="About the pet"></ion-textarea>
              </ion-item>
            </div>

            <div>

              <ion-label>Birthday</ion-label>
              <ion-item class="custom-input" @click="showDatePicker = true">
                <ion-input readonly :value="formattedDate || 'Select Date'" color="medium"></ion-input>
              </ion-item>
              <p class="error-message" v-if="dateErrorMessage">{{ dateErrorMessage }}</p>

              <div class="datetime-wrapper">
                <ion-datetime aria-label="Birthday" v-show="showDatePicker" display-format="DD/MM/YYYY" picker-format="DD/MM/YYYY"
                  @ionChange="dateSelected($event.detail.value as string)" presentation="date"></ion-datetime>
              </div>
            </div>

            <ion-buttons class="button-container">
              <ion-button type="submit" class="edit-pet-button">Update Pet</ion-button>
              <ion-button @click="cancelEdit" class="edit-pet-button">Cancel</ion-button>
            </ion-buttons>

          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>



<script setup lang="ts">
import { computed, ref, onBeforeMount, Ref } from 'vue';
import { IonPage, IonContent, IonItem, IonInput, IonTextarea, IonDatetime, IonButton, IonButtons, IonLabel } from '@ionic/vue';
import { useRouter, useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useAppStore } from '@/store/app';
import { Pet } from '@/types/pet';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();
const route = useRoute();

const petStore = usePetStore();

const dateErrorMessage = ref('');
const existingPetObject: Ref<Pet> = ref({
  id: '',
  name: '',
  breed: '',
  species: '',
  description: '',
  birthday: new Date(),
});
const showDatePicker = ref(false);

onBeforeMount(() => {
  if (!existingPetObject.value || !existingPetObject.value.id) {
    loadPetData();
  }
});

const dateSelected = (selectedDateString: string) => {
  const currentDate = new Date();
  const selectedDate = new Date(selectedDateString);
  if (selectedDate <= currentDate) {
    dateErrorMessage.value = '';
    existingPetObject.value.birthday = new Date(selectedDateString);
    showDatePicker.value = false;
  } else {
    dateErrorMessage.value = 'Please select a date in the past or today';
  }
};

const formattedDate = computed(() => {
  return existingPetObject.value.birthday
    ? new Date(existingPetObject.value.birthday).toLocaleDateString('en-CA')
    : '';
});


const confirmUpdatePet = () => {
  if (window.confirm('Are you sure you want to update this pet?')) {
    updatePet();
  }
};


const updatePet = async () => {
  const petData = {
    id: existingPetObject.value.id,
    name: existingPetObject.value.name,
    species: existingPetObject.value.species,
    breed: existingPetObject.value.breed,
    description: existingPetObject.value.description,
    birthday: existingPetObject.value.birthday,
  };

  const success = await petStore.updatePet(existingPetObject.value.id, petData);
  if (success) {
    console.log('Pet updated successfully');
    router.push({ name: 'pet', params: { id: petData.id } }); // Update to the correct route name if different
  } else {
    console.error('Failed to update pet');
  }
};


const loadPetData = async () => {
  const petId = route.params.id as string; // Get the pet ID from the route params
  if (petId) {
    const petData = await petStore.getPetById(petId);
    if (petData) {
      existingPetObject.value = { ...petData };
    } else {
      // If there is no pet data, redirect to the home page
      router.push({ name: 'pet', params: { id: petId } });
    }
  }
};

const cancelEdit = () => {
  router.push({ name: 'pet', params: { id: existingPetObject.value?.id } }); // Update to the correct route name if different
};
</script>



<style scoped>
.edit-pet-container {
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: auto;
  padding: 20px;
  background-color: var(--color-card-background-lilac);
  border-radius: 50px;
  border: 2px solid var(--color-card-border);
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
}

.edit-pet-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Button container for update pet and cancel buttons */
.button-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

/* Update pet and cancel buttons */
.edit-pet-button {
  --background: var(--ion-color-primary);
  --padding-start: 10px;
  --padding-end: 10px;
  --background: var(--color-button-pet-page);
  --border-radius: 20px !important;
}
</style>
