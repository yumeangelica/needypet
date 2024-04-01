<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Add New Pet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="add-pet-container">
        <form @submit.prevent="submitPet" class="add-pet-form">
          <ion-item class="custom-input">
            <ion-input aria-label="Name" v-model="newPetObject.name" required placeholder="Pet's name"></ion-input>
          </ion-item>

          <ion-item class="custom-input">
            <ion-input aria-label="Breed" v-model="newPetObject.breed" placeholder="Pet's breed"></ion-input>
          </ion-item>

          <ion-item class="custom-input">
            <ion-input aria-label="Species" v-model="newPetObject.species" placeholder="Pet's species"></ion-input>
          </ion-item>

          <ion-item class="custom-input">
            <ion-textarea aria-label="Description" v-model="newPetObject.description" placeholder="About the pet"></ion-textarea>
          </ion-item>

          <ion-item class="custom-input" @click="showDatePicker = true">
            <ion-input readonly :value="formattedDate || 'Select Date'" color="medium"></ion-input>
          </ion-item>
          <ion-datetime aria-label="Birthday" v-show="showDatePicker" display-format="DD/MM/YYYY" picker-format="DD/MM/YYYY"
            @ionChange="dateSelected($event.detail.value as string)" presentation="date"></ion-datetime>

          <ion-button type="submit" expand="block" class="submit-button">Add Pet</ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonButton
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';

const router = useRouter();
const petStore = usePetStore();
const userStore = useUserStore();

const userId = ref(userStore.id);

const newPetObject = ref({
  name: '',
  breed: '',
  species: '',
  description: '',
  birthday: new Date()
});
const showDatePicker = ref(false);

const hideDatePicker = () => {
  showDatePicker.value = false;
};

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

const formattedDate = computed(() => {
  if (!newPetObject.value.birthday) {
    return '';
  }
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(newPetObject.value.birthday).toLocaleDateString(undefined, options);
});


const submitPet = async () => {
  if (!newPetObject.value.name) {
    console.log('Please fill the name field');
    return;
  }

  if (!userId.value) {
    console.log('User ID not found');
    return;
  }

  console.log('Submitting pet:', newPetObject.value);

  const response = await petStore.addNewPet(newPetObject.value);
  if (response) {
    router.push({ name: 'home' }); // Navigate user after success
  } else {
    console.log('Failed to add pet');
  }

};

</script>

<style scoped>
.add-pet-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background-color: var(--color-card-background-lilac);
  border-radius: 20px;
  box-shadow: 1px 1px 4px var(--color-drop-shadow-pink);
}

.add-pet-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.custom-input,
.ion-datetime {
  background-color: var(--color-login-input-background);
  border-radius: 20px;
  --padding-start: 10px;
  --color: var(--color-text-lilac);
}

.custom-input ion-label {
  color: var(--color-text-lilac);
}

.submit-button {
  --background: var(--color-login-button-and-border);
  --color: white;
  font-weight: bold;
  margin-top: 20px;
  border-radius: 20px;
}

.submit-button:hover {
  box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
}
</style>
