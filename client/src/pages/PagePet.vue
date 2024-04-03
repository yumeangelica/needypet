<template>
  <ion-page>
    <ion-content :key="currentDate">
      <div class="content-wrapper">
        <div v-if="pet" class="pet-container">
          <div class="full-pet-card">
            <h3 class="pet-name">{{ pet.name }}</h3>
            <div class="pet-info">
              <p><strong>Description:</strong> {{ pet.description }}</p>
              <p><strong>Species:</strong> {{ pet.species }} </p>
              <p><strong>Breed:</strong> {{ pet.breed }}</p>
              <p><strong>Birthday:</strong> {{ pet.birthday }}</p>
              <p><strong>Owner:</strong> {{ pet.owner.userName }}</p>
              <p v-if="pet.careTakers.length > 0"><strong>Care takers:</strong> <span v-for="(careTaker, index) in pet.careTakers" :key="careTaker.id">{{ careTaker.userName }}{{ index !== pet.careTakers.length - 1 ? ', ' : '' }}</span></p>
            </div>

            <!-- Need related container -->
            <div class="header-button-container">

              <h3 class="ion-text-center">Needs:</h3>
              <ion-button class="custom-button" @click="setOpen(true)" v-if="pet.owner.id === userStore.id">
                <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                Add need
              </ion-button>

            </div>

            <!-- Modal which opens when 'add need' button is clicked -->
            <ion-modal :is-open="isOpen">
              <ion-header>
                <ion-toolbar>
                  <ion-buttons slot="end">
                    <ion-button @click="setOpen(false)">Close form</ion-button>
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

                <div class="confirm-button-container">
                  <ion-button class="custom-button" @click="confirm()">Confirm</ion-button>
                  <ion-button class="custom-button" @click="selection = ''" v-if="selection">Return</ion-button>
                </div>

                <!-- Error message if details are not correct -->
                <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
              </ion-content>
            </ion-modal>
            <!-- Modal ends -->

            <div v-if="pet && needsByDate">
              <!-- Date navigation buttons -->
              <div class="date-navigation">
                <ion-button class="custom-button" @click="changeDay(-1)">Previous day</ion-button>
                <h3>{{ currentDate }}</h3>
                <ion-button class="custom-button" @click="changeDay(1)">Next Day</ion-button>
              </div>

              <!-- Needs for the selected date -->
              <ul v-if="needsByDate[currentDate]">
                <li v-for="need in needsByDate[currentDate]" :key="need.id">
                  <div class="cards-container">
                    <the-need-card :need="need" :petId="pet.id" />
                  </div>
                </li>
              </ul>
              <p v-else style="text-align: center;">No needs for today</p>
            </div>

          </div>
        </div>

        <div v-else class="pet-container">
          <p>Pet not found</p>
        </div>

      </div>

    </ion-content>

  </ion-page>
</template>


<script setup lang="ts">
import { onBeforeMount, ref, computed, watch, Ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import { IonPage, IonContent, IonButton, IonModal, IonDatetime, IonItem, IonTitle, IonToolbar, IonHeader, IonButtons, IonInput, IonRadio, IonSelect, IonSelectOption, IonLabel, IonRadioGroup, IonIcon } from '@ionic/vue';
import { addCircleOutline } from 'ionicons/icons';
import { Pet, Need } from '@/types/pet';
import TheNeedCard from '@/components/TheNeedCard.vue';
import moment from 'moment-timezone';

const route = useRoute();
const petStore = usePetStore();
const userStore = useUserStore();

const pet: Ref<Pet | null> = ref(null);
const isOpen: Ref<boolean> = ref(false);

const category: Ref<Need['category']> = ref('');
const description: Ref<Need['description']> = ref('');
const dateFor: Ref<Need['dateFor']> = ref('');
const errorMessage: Ref<string> = ref('');
const isDatetimeModalOpen: Ref<boolean> = ref(false);

const selection: Ref<string> = ref('');
const valueOfSelection: Ref<Need['duration']['value'] | Need['quantity']['value']> = ref(0);
const unitOfSelection: Ref<Need['duration']['unit'] | Need['quantity']['unit'] | ''> = ref('');

const currentDate = ref(moment().format('YYYY-MM-DD')); // Initalized to today's date

const changeDay = (delta: number) => {
  let newDate = moment.tz(currentDate.value, userStore.timezone).add(delta, 'days');
  currentDate.value = newDate.format('YYYY-MM-DD');
};

const needsByDate = computed(() => {
  if (!pet.value || !pet.value.needs) return [];
  return pet.value.needs.reduce((acc: Record<string, Need[]>, need) => {
    if (!acc[need.dateFor]) {
      acc[need.dateFor] = [];
    }
    acc[need.dateFor].push(need);
    return acc;
  }, {});
});


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
  dateFor.value = '';
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
  if (!dateFor.value) return '';
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateFor.value).toLocaleDateString(undefined, options);

});

// When the user selects a date from the datetime picker modal this function is called
const dateSelected = (selectedDateString: string) => {
  const selectedDateTime = new Date(selectedDateString);
  const currentDateTime = new Date();
  currentDateTime.setHours(0, 0, 0, 0);

  if (selectedDateTime >= currentDateTime) { // Check if the selected date is today or in the future
    dateFor.value = selectedDateString;
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

  if (!category.value || !description.value || !dateFor.value || !selection.value || !valueOfSelection.value || !unitOfSelection.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  const needObject: Need = {
    category: category.value,
    description: description.value,
    dateFor: dateFor.value.toString().split('T')[0],
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
    unitOfSelection.value = 'minutes';
  }
});

onBeforeMount(() => {
  const id = route.params.id as string;
  if (id) {
    getPet(id);
  }
});

</script>

<style scoped>

ion-content {
  overflow-y: auto;
}

.pet-container,
.header-button-container,
.date-navigation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.full-pet-card {
  background-color: var(--color-card-background-lilac);
  border-radius: 50px;
  border: 2px solid var(--color-card-border);
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
  padding: 10px;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  transition: transform 0.3s ease;
}

.full-pet-card:hover {
  transform: translateY(-5px);
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.custom-button {
  --background: var(--color-button-pet-page);
  --color: #fff;
  --border-radius: 20px;
  --box-shadow: 1px 1px 2px var(--color-drop-shadow-pink);
}

.custom-button:hover {
  --box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
}

ion-button {
  min-width: 100px;
  max-width: 200px;
}

ion-datetime {
  --padding-start: 0;
  --padding-end: 0;
  width: 100%;
  --background: var(--color-card-background-lilac);
  color: var(--color-text-lilac);
  max-width: 90%;
  margin: 0 auto;
}

ion-modal {
  --border-radius: 20px;
  --width: 95%;
  --max-width: 800px;
  --max-height: 600px;
  --background: var(--color-card-background-lilac);
}

ion-item {
  margin: 10px 0;
}

.error-message {
  color: var(--color-error-message);
  text-align: center;
  margin-top: 20px;
}


/* Mobile styles */
@media (min-width: 768px) {
  .date-navigation {
    flex-direction: row;
    justify-content: space-around;
  }
}

@media (max-width: 768px) {
  .pet-container h3,
  .pet-container p,
  .error-message,
  ion-modal ion-title,
  ion-modal ion-content,
  ion-modal ion-label,
  ion-modal ion-button,
  ion-modal ion-item,
  ion-modal .error-message,
  li,
  .custom-button {
    font-size: 14px;
  }

  .pet-name,
  ion-modal ion-title {
    font-size: 16px;
  }

  ion-modal .error-message,
  .custom-button {
    font-size: 12px;
  }
}

</style>