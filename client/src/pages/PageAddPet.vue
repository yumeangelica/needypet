<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="add-pet-container">
          <h2 class="ion-text-center">Add new pet:</h2>
          <form @submit.prevent="submitPet" class="add-pet-form">
            <ion-item>
              <ion-input aria-label="Name" v-model="newPetObject.name" required placeholder="Pet's name"></ion-input>
            </ion-item>

            <ion-item>
              <ion-input aria-label="Breed" v-model="newPetObject.breed" placeholder="Pet's breed"></ion-input>
            </ion-item>

            <ion-item>
              <ion-input aria-label="Species" v-model="newPetObject.species" placeholder="Pet's species"></ion-input>
            </ion-item>

            <ion-item>
              <ion-textarea aria-label="Description" v-model="newPetObject.description" placeholder="About the pet"></ion-textarea>
            </ion-item>

            <ion-item @click="showDatePicker = true">
              <ion-input readonly :value="formattedDate || 'Select Date'" color="medium"></ion-input>
            </ion-item>

            <div class="datetime-wrapper">
              <ion-datetime aria-label="Birthday" v-show="showDatePicker" display-format="DD/MM/YYYY" picker-format="DD/MM/YYYY"
                @ionChange="dateSelected($event.detail.value as string)" presentation="date"></ion-datetime>
            </div>

            <div class="center-button-group">
              <ion-button type="submit" class="custom-button">Add Pet</ion-button>
              <ion-button @click="router.push({ name: 'home' })" class="custom-button">Cancel</ion-button>
            </div>

          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import { computed, ref, Ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { IonButton, IonContent, IonDatetime, IonInput, IonItem, IonPage, IonTextarea } from '@ionic/vue';
import { NewPetObject } from '@/types/pet';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();
const petStore = usePetStore();
const userStore = useUserStore();

const userId: Ref<string | null> = ref(userStore.id);

const newPetObject: Ref<NewPetObject> = ref({
  name: '',
  breed: '',
  species: '',
  description: '',
  birthday: null as Date | null,
});
const showDatePicker = ref(false);

const hideDatePicker = () => {
  showDatePicker.value = false;
};

// Set the selected date
const dateSelected = (selectedDateString: string) => {
  const selectedDateTime = new Date(selectedDateString);
  selectedDateTime.setHours(0, 0, 0, 0);
  const currentDateTime = new Date();
  currentDateTime.setHours(0, 0, 0, 0);

  if (selectedDateTime <= currentDateTime) { // Check if selected date is not in the future
    newPetObject.value.birthday = selectedDateTime;
  }

  hideDatePicker();
};

// Format the date for display
const formattedDate = computed(() => {
  if (!newPetObject.value.birthday) {
    return '';
  }
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(newPetObject.value.birthday).toLocaleDateString(undefined, options);
});

// Reset the form when navigating away
onBeforeRouteLeave((to, from, next) => {
  newPetObject.value = {
    name: '',
    breed: '',
    species: '',
    description: '',
    birthday: null,
  };
  next();
});

// Submit the new pet to the store
const submitPet = async () => {
  if (!newPetObject.value.name) {
    return;
  }

  if (!userId.value) {
    return;
  }

  const response = await petStore.addNewPet(newPetObject.value);
  if (response) {
    newPetObject.value = {
      name: '',
      breed: '',
      species: '',
      description: '',
      birthday: null,
    };
    router.push({ name: 'home' }); // Navigate user after success
    appStore.addNotification('Pet added successfully', 'success');
  } else {
    appStore.addNotification('Failed to add pet, please try again later', 'error');
  }
};

</script>


<style scoped>
  .center-button-group {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .add-pet-container {
    display: flex;
    flex-direction: column;
    max-width: 500px;
    margin: auto;
    margin-top: 30px;
    padding: 20px;
    background-color: var(--color-card-background-lilac);
    border-radius: 50px;
    border: 1px solid var(--color-card-border);
    box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
  }

  .add-pet-form {
    display: flex;
    flex-direction: column;
  }
</style>
