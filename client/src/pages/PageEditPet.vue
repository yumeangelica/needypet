<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="form-container">
          <form @submit.prevent="confirmUpdatePet">
            <h3 class="form-header">Edit Pet</h3>

            <div>
              <ion-label>Name:</ion-label>
              <ion-item class="form-field-item">
                <ion-input class="form-field-input" aria-label="Name" v-model="existingPetObject.name" required
                  placeholder="Enter pet's name"></ion-input>
              </ion-item>
            </div>

            <div>
              <ion-label>Breed:</ion-label>
              <ion-item class="form-field-item">
                <ion-input class="form-field-input" aria-label="Breed" v-model="existingPetObject.breed" placeholder="Enter pet's breed"></ion-input>
              </ion-item>
            </div>

            <div>
              <ion-label>Species:</ion-label>
              <ion-item class="form-field-item">
                <ion-input class="form-field-input" aria-label="Species" v-model="existingPetObject.species"
                  placeholder="Enter pet's species"></ion-input>
              </ion-item>
            </div>

            <div>
              <ion-label>Description</ion-label>
              <ion-item class="form-field-item">
                <ion-textarea class="form-field-input" aria-label="Description" v-model="existingPetObject.description"
                  placeholder="About the pet"></ion-textarea>
              </ion-item>
            </div>

            <div>
              <ion-label>Birthday</ion-label>
              <ion-item class="form-field-item" data-clickable="true" @click="showDatePicker = true">
                <ion-input class="form-field-input" readonly :value="formattedDate || 'Select Date'" color="medium"></ion-input>
              </ion-item>
              <p class="custom-error-message" v-if="dateErrorMessage">{{ dateErrorMessage }}</p>

              <div class="datetime-wrapper">
                <ion-datetime aria-label="Birthday" v-show="showDatePicker" display-format="DD/MM/YYYY" picker-format="DD/MM/YYYY"
                  @ionChange="dateSelected($event.detail.value as string)" presentation="date"></ion-datetime>
              </div>
            </div>

            <div class="form-button-group">
              <ion-button type="submit" class="form-button primary">Update Pet</ion-button>
              <ion-button @click="cancelEdit" class="form-button secondary">Cancel</ion-button>
              <ion-button class="form-button danger" @click="confirmDeletePet()">
                <ion-icon :icon="trashOutline"></ion-icon>Delete Pet
              </ion-button>
            </div>

          </form>
        </div>
      </div>
      <TheFooter />
    </ion-content>
  </ion-page>
</template>



<script setup lang="ts">
import { computed, ref, onBeforeMount, Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useAppStore } from '@/store/app';
import { Pet } from '@/types/pet';
import { trashOutline } from 'ionicons/icons';
import { IonButton, IonContent, IonDatetime, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonTextarea } from '@ionic/vue';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const route = useRoute();
const petStore = usePetStore();

const dateErrorMessage = ref('');
const existingPetObject: Ref<Pet> = ref({ // Create a reactive reference to the pet object, updated when the pet data is loaded
  id: '',
  name: '',
  breed: '',
  species: '',
  description: '',
  birthday: null as Date | null,
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
    existingPetObject.value.birthday.setHours(0, 0, 0, 0);
    showDatePicker.value = false;
  } else {
    dateErrorMessage.value = 'Please select a date in the past or today';
  }
};

// Format the date for display
const formattedDate = computed(() => {
  return existingPetObject.value.birthday
    ? new Date(existingPetObject.value.birthday).toLocaleDateString('en-GB')
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