<template>
  <ion-page>
    <ion-content>
      <div class="pet-container" v-if="pet">
        <div class="pet-card">
          <h2 class="pet-name">{{ pet.name }}</h2>
          <div class="pet-info">
            <p><strong>Description:</strong> {{ pet.description }}</p>
            <p><strong>Breed:</strong> {{ pet.breed }}</p>
            <p><strong>Birthday:</strong> {{ pet.birthday }}</p>
          </div>

          <div class="pet-owner">
            <h3>Owner</h3>
            <p>{{ pet.owner.userName }}</p>
          </div>

          <div class="care-takers" v-if="pet.careTakers.length > 0">
            <h3>Care takers</h3>
            <ul>
              <li v-for="careTaker in pet.careTakers" :key="careTaker.id">{{ careTaker.userName }}</li>
            </ul>
          </div>

          <div class="header-button-container">
            <h3>Needs:</h3>
            <ion-button class="custom-button" color="primary" @click="setOpen(true)" v-if="pet.owner.id === userStore.id">
              <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
              Add need
            </ion-button>
          </div>

          <ion-modal :is-open="isOpen">
            <ion-header>
              <ion-toolbar>
                <ion-title>New need</ion-title>
                <ion-buttons slot="start">
                  <ion-button @click="setOpen(false)">Close</ion-button>
                </ion-buttons>
                <ion-buttons slot="end">
                  <ion-button :strong="true" @click="confirm()">Confirm</ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">

              <ion-item>
                <ion-input v-model="category" label="Category" placeholder="input need's category (e.g. walk or feed)"></ion-input>
              </ion-item>

              <ion-item>
                <ion-input v-model="description" label="Description" placeholder="input need's description"></ion-input>
              </ion-item>

              <ion-item @click="openDatetimeModal()">
                <ion-input readonly :value="formattedDate || 'Select Date'" placeholder="Select Date"></ion-input>
              </ion-item>
              <ion-modal :is-open="isDatetimeModalOpen" @didDismiss="closeDatetimeModal()">
                <ion-header>
                  <ion-toolbar>
                    <ion-title>Select Date</ion-title>
                  </ion-toolbar>
                </ion-header>
                <ion-content>
                  <ion-datetime display-format="DD/MM/YYYY" picker-format="DD/MM/YYYY" presentation="date"
                    @ionChange="dateSelected($event.detail.value as string)"></ion-datetime>
                </ion-content>
              </ion-modal>

              <ion-item v-show="!selection">
                <ion-label>Choose</ion-label>
                <ion-radio-group v-model="selection">
                  <ion-item>
                    <ion-radio slot="start" value="duration">Duration</ion-radio>
                  </ion-item>
                  <ion-item>
                    <ion-radio slot="start" value="quantity">Quantity</ion-radio>
                  </ion-item>
                </ion-radio-group>
              </ion-item>

              <div v-if="selection === 'quantity'">
                <ion-item lines="none">
                  <ion-input v-model="valueOfSelection" label="Enter value"></ion-input>
                  <ion-select v-model="unitOfSelection" interface="popover">
                    <ion-select-option v-for="unit in units[selection]" :key="unit" :value="unit">{{ unit }}</ion-select-option>
                  </ion-select>
                </ion-item>
              </div>

              <div v-if="selection === 'duration'">
                <ion-item lines="none">
                  <ion-input v-model="valueOfSelection" label="Enter duration"></ion-input>
                  <ion-label>minute(s)</ion-label>
                </ion-item>
              </div>


              <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
            </ion-content>
          </ion-modal>

          <div class="pet-needs" v-if="pet.needs.length > 0"></div>
          <ul>
            <li v-for="need in pet.needs" :key="need.id">{{ need.category }}: {{ need.description }}</li>
          </ul>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import { onMounted, ref, computed, watch, Ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import { IonPage, IonContent, IonButton, IonModal, IonDatetime, IonItem, IonTitle, IonToolbar, IonHeader, IonButtons, IonInput, IonRadio, IonSelect, IonSelectOption, IonLabel, IonRadioGroup, IonIcon } from '@ionic/vue';
import { addCircleOutline } from 'ionicons/icons';
import { Pet, Need } from '@/types/pet';

const route = useRoute();
const petStore = usePetStore();
const userStore = useUserStore();

const pet: Ref<Pet | null> = ref(null);
const isOpen: Ref<boolean> = ref(false);


const category: Ref<Need['category']> = ref('');
const description: Ref<Need['description']> = ref('');
const date: Ref<Need['dateFor']> = ref('');
const errorMessage: Ref<string> = ref('');
const isDatetimeModalOpen: Ref<boolean> = ref(false);

const selection: Ref<string> = ref('');
const valueOfSelection: Ref<Need['duration']['value'] | Need['quantity']['value']> = ref(0);
const unitOfSelection: Ref<Need['duration']['unit'] | Need['quantity']['unit'] | ''> = ref('');


const units = {
  duration: 'minutes',
  quantity: ['ml', 'g']
};

const setOpen = (open: boolean) => {
  isOpen.value = open;
  clearFields();
};

// Clear all modal fields
const clearFields = () => {
  category.value = '';
  description.value = '';
  date.value = '';
  selection.value = '';
  valueOfSelection.value = 0;
  unitOfSelection.value = '';
  errorMessage.value = '';
};

const openDatetimeModal = () => {
  isDatetimeModalOpen.value = true;
};


const closeDatetimeModal = () => {
  isDatetimeModalOpen.value = false;
};


// Computed property to format the date which is displayed in the input field
const formattedDate = computed(() => {
  if (!date.value) return '';
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(date.value).toLocaleDateString(undefined, options);

});

// When the user selects a date from the datetime picker modal this function is called
const dateSelected = (selectedDateString: string) => {
  const selectedDateTime = new Date(selectedDateString);
  const currentDateTime = new Date();
  currentDateTime.setHours(0, 0, 0, 0);

  if (selectedDateTime >= currentDateTime) { // Check if the selected date is today or in the future
    date.value = selectedDateString;
    errorMessage.value = '';
  } else {
    errorMessage.value = 'Please select a current or future date.';
  }
  closeDatetimeModal();

};

// Fetch the pet from the store
async function getPet(id: string) {
  const fetchedPet = await petStore.getPetById(id);
  if (fetchedPet) {
    fetchedPet.needs = fetchedPet.needs.filter((need) => !need.archived);
    pet.value = fetchedPet;
  }
}

// When the user clicks the confirm button on the modal this function is called
const confirm = async () => {

  if (!category.value || !description.value || !date.value || !selection.value || !valueOfSelection.value || !unitOfSelection.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  const needObject: Need = {
    category: category.value,
    description: description.value,
    dateFor: date.value.toString().split('T')[0],
    [selection.value]: {
      value: valueOfSelection.value,
      unit: unitOfSelection.value
    }
  };

  try {
    const response = await petStore.addNewNeed(pet.value.id, needObject);
    if (response) {
      setOpen(false);
      getPet(pet.value.id);
    } else {
      errorMessage.value = 'Failed to add need';
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Failed to add need';
  }
};


watch(selection, (newValue) => {
  if (newValue === 'duration') {
    unitOfSelection.value = "minutes";
  }
});

onMounted(() => {
  const id = route.params.id as string;
  if (id) {
    getPet(id);
  }
});

</script>



<style scoped>
.pet-container {
  display: flex;
  justify-content: center;
  padding: 10px 20px;
  margin-top: 60px;
}

.pet-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 20px;
  max-width: 800px;
  width: 100%;
}

.pet-name {
  text-align: center;
  margin-bottom: 30px;
}

.pet-info,
.pet-owner,
.care-takers,
.pet-needs {
  margin-bottom: 20px;
}

.header-button-container {
  display: inline-flex;

}

.custom-button {
  font-size: 10px;
  padding-top: 10px;
}
</style>
