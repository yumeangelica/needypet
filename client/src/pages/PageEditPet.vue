<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="edit-pet-profile-container">
          <form @submit.prevent="confirmUpdatePet" class="edit-pet-profile-form">
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
              <p class="custom-error-message" v-if="dateErrorMessage">{{ dateErrorMessage }}</p>

              <div class="datetime-wrapper">
                <ion-datetime aria-label="Birthday" v-show="showDatePicker" display-format="DD/MM/YYYY" picker-format="DD/MM/YYYY"
                  @ionChange="dateSelected($event.detail.value as string)" presentation="date"></ion-datetime>
              </div>
            </div>

            <ion-buttons class="button-container">
              <ion-button type="submit" class="edit-pet-profile-button">Update Pet</ion-button>
              <ion-button @click="cancelEdit" class="edit-pet-profile-button">Cancel</ion-button>

              <ion-button class="edit-pet-profile-button" @click="confirmDeletePet()">
                <ion-icon :icon="trashOutline"></ion-icon>Delete Pet
              </ion-button>
            </ion-buttons>

          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>



<script setup lang="ts">
import { computed, ref, onBeforeMount, Ref, defineAsyncComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useAppStore } from '@/store/app';
import { Pet } from '@/types/pet';
// Lazy load the components for better performance
const IonPage = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonPage));
const IonContent = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonContent));
const IonItem = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonItem));
const IonInput = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonInput));
const IonTextarea = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonTextarea));
const IonDatetime = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonDatetime));
const IonButton = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButton));
const IonButtons = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButtons));
const IonLabel = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonLabel));
const IonIcon = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonIcon));

import { trashOutline } from 'ionicons/icons';

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

// Load the pet data when the component is mounted
onBeforeMount(() => {
  if (!existingPetObject.value || !existingPetObject.value.id) {
    loadPetData();
  }
});

// Function to handle the date selected from the date picker
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

// Format the date for display
const formattedDate = computed(() => {
  return existingPetObject.value.birthday
    ? new Date(existingPetObject.value.birthday).toLocaleDateString('en-CA')
    : '';
});


// Confirm the update of the pet and then call the updatePet function
const confirmUpdatePet = () => {
  if (window.confirm('Are you sure you want to update this pet?')) {
    updatePet();
  }
};


// Update the pet data and then navigate to the pet view page (PagePet)
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


// Confirm the deletion of the pet and then call the deletePet function
const confirmDeletePet = () => {
  if (window.confirm('Are you sure you want to delete this pet?')) {
    deletePet();
  }
};

const deletePet = async () => {
  // Check if the pet ID exists
  if (existingPetObject.value && existingPetObject.value.id) {
    const success = await petStore.deletePet(existingPetObject.value.id);
    if (success) {
      router.push({ name: 'home' });
    } else {
      console.error('Failed to delete pet');
    }
  }
};

// Load the pet data from the store
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

// Cancel the edit and navigate back to the pet view page (PagePet)
const cancelEdit = () => {
  router.push({ name: 'pet', params: { id: existingPetObject.value?.id } }); // Update to the correct route name if different
};
</script>