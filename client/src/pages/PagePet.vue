<template>
  <ion-page>
    <ion-content :key="currentDate">
      <div v-if="$route.matched.length === 1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div v-if="pet" class="pet-container">
          <div class="full-pet-card">

            <div class="inline-container">
              <h2>{{ pet.name }}</h2>
              <ion-button v-if="pet.owner.id === userStore.id" slot="start" class="settings-button" @click="router.push({ name: 'edit-pet' })"><ion-icon
                  :icon="settingsOutline"></ion-icon>
              </ion-button>
            </div>

            <div class="pet-info">
              <p><strong>Description:</strong> {{ pet.description }}</p>
              <p><strong>Species:</strong> {{ pet.species }} </p>
              <p><strong>Breed:</strong> {{ pet.breed }}</p>
              <p><strong>Birthday:</strong> {{ pet.birthday }}</p>
              <p><strong>Owner:</strong> {{ pet.owner.userName }}</p>
              <p v-if="pet.careTakers.length > 0"><strong>Care takers:</strong> <span v-for="(careTaker, index) in pet.careTakers"
                  :key="careTaker.id">{{ careTaker.userName }}{{ index !== pet.careTakers.length - 1 ? ', ' : '' }}</span></p>
            </div>

            <!-- Need related container -->
            <div class="header-button-container">
              <h3 class="ion-text-center">Needs:</h3>
              <template v-if="pet.owner.id === userStore.id && currentDate === dayjs().tz(userStore.timezone).format('YYYY-MM-DD')">
                <ion-button class="custom-button" @click="setOpen(true)" v-if="needsByDate[currentDate] ? needsByDate[currentDate]?.length < 10 : true">
                  <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                  Add need
                </ion-button>
                <p v-else>Daily need limit reached</p>
              </template>
              <ion-button class="custom-button" @click="currentDate = dayjs().tz(userStore.timezone).format('YYYY-MM-DD')"
                v-if="currentDate !== dayjs().tz(userStore.timezone).format('YYYY-MM-DD')">
                Today
              </ion-button>
            </div>

            <!-- Modal which opens when 'add need' button is clicked -->
            <ion-modal :is-open="isOpen">
              <ion-header>
                <ion-toolbar>
                  <ion-title>New need</ion-title>
                  <ion-buttons slot="end">
                    <ion-button @click="setOpen(false)">Close form</ion-button>
                  </ion-buttons>
                </ion-toolbar>
              </ion-header>

              <ion-content class="ion-padding">
                <form @submit.prevent="addNewNeed">

                  <ion-item>
                    <ion-input v-model="category" label="Category" required placeholder="input need's category (e.g. walk or feed)"></ion-input>
                  </ion-item>

                  <ion-item>
                    <ion-input v-model="description" label="Description" required placeholder="input need's description"></ion-input>
                  </ion-item>

                  <!-- display dateFor as currentDate -->
                  <ion-item>
                    <ion-input readonly :value="currentDate" required label="Date"></ion-input>
                  </ion-item>

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

                  <!-- unit dropdown -->
                  <div v-if="selection === 'quantity'">
                    <ion-item lines="none">
                      <ion-input v-model="valueOfSelection" label="Enter value" required :autofocus="true" @input="cleanInput($event)"></ion-input>
                      <ion-select v-model="unitOfSelection" interface="popover" required>
                        <ion-select-option disabled selected value="">select unit</ion-select-option>
                        <ion-select-option v-for="unit in units[selection]" :key="unit" :value="unit">{{ unit }}</ion-select-option>
                      </ion-select>
                    </ion-item>
                  </div>


                  <div v-if="selection === 'duration'">
                    <ion-item lines="none">
                      <ion-input v-model="valueOfSelection" label="Enter duration" required :autofocus="true" @input="cleanInput($event)"></ion-input>
                      <ion-label>minute(s)</ion-label>
                    </ion-item>
                  </div>


                  <div class="confirm-button-container">
                    <ion-button class="custom-button" type="submit">Confirm</ion-button>
                    <ion-button class="custom-button" @click="() => { selection = ''; valueOfSelection = null; unitOfSelection = ''; }"  v-if="selection">Return to selection</ion-button>
                  </div>

                  <!-- formfieldsobject duration or quantity and after that duration cannot be over 1440 minutes -->
                  <div v-if="formFieldsErrorDetailsObject.selection" class="custom-error-message">{{ formFieldsErrorDetailsObject.selection }}</div>
                  <div v-if="formFieldsErrorDetailsObject.durationValue" class="custom-error-message">{{ formFieldsErrorDetailsObject.durationValue }}</div>
                  <div v-if="formFieldsErrorDetailsObject.quantityUnit" class="custom-error-message">{{ formFieldsErrorDetailsObject.quantityUnit }}</div>

                </form>
              </ion-content>
            </ion-modal>
            <!-- Modal ends -->

            <div v-if="pet && needsByDate">
              <!-- Date navigation buttons -->
              <div class="date-navigation">
                <ion-button class="custom-button" @click="changeDay(-1)">Previous day</ion-button>
                <h4>{{ currentDate }}</h4>
                <ion-button class="custom-button" @click="changeDay(1)">Next Day</ion-button>
              </div>

              <!-- Needs for the selected date -->
              <ul v-if="needsByDate[currentDate]">
                <li v-for="need in needsByDate[currentDate]" :key="need.id">
                  <div class="need-cards-container">
                    <the-need-card :need="need" :petId="pet.id" @needDeleted="handleNeedDeleted" />
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
      <div v-else>
        <router-view />
      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed, watch, Ref, provide } from 'vue';
import { useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import { addCircleOutline, settingsOutline } from 'ionicons/icons';
import { Pet, Need } from '@/types/pet';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { IonPage, IonButton, IonContent, IonModal, IonItem, IonToolbar, IonHeader, IonButtons, IonInput, IonRadio, IonSelect, IonSelectOption, IonLabel, IonRadioGroup, IonIcon, IonTitle } from '@ionic/vue';
import TheNeedCard from '@/components/TheNeedCard.vue';

dayjs.extend(utc);
dayjs.extend(timezone);

const router = useRouter();
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const route = useRoute();
const petStore = usePetStore();
const userStore = useUserStore();

const currentDate: Ref<string> = ref(dayjs().tz(userStore.timezone).format('YYYY-MM-DD')); // Initalized to today's date
const pet: Ref<Pet | null> = ref(null);
const isOpen = ref(false);
const category: Ref<Need['category']> = ref('');
const description: Ref<Need['description']> = ref('');

const formFieldsErrorDetailsObject = ref({
  selection: '',
  durationValue: '',
  quantityUnit: '',
});

const selection = ref('');
const valueOfSelection: Ref<Need['duration']['value'] | Need['quantity']['value']> = ref(null);
const unitOfSelection: Ref<Need['duration']['unit'] | Need['quantity']['unit'] | ''> = ref('');
const isOwner = ref(false);

const changeDay = (delta: number) => {
  const newDate = dayjs.tz(currentDate.value, userStore.timezone).add(delta, 'days');
  currentDate.value = newDate.format('YYYY-MM-DD');
};

const needsByDate = ref({});

const needsByDateComputed = computed(() => {
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
  selection.value = '';
  valueOfSelection.value = null;
  unitOfSelection.value = '';
};

const cleanInput = (event) => {
  // Remove all alphabets and special characters from the input value
  event.target.value = event.target.value.replace(/[^0-9]/g, '');

  // Remove leading zeros from the input value
  let value = event.target.value;
  value = value.replace(/^0+/, '');

  // Update the valueOfSelection reactive property
  valueOfSelection.value = Number(value);
};

// Fetch the pet from the store
async function getPet(id: string) {
  const fetchedPet = await petStore.getPetById(id);
  if (fetchedPet) {
    pet.value = fetchedPet;
    needsByDate.value = needsByDateComputed.value;
  }
  isOwner.value = await petStore.isOwner(id);
}

// When the user clicks the addNewNeed button on the modal this function is called
const addNewNeed = async () => {

  if (!category.value || !description.value) {
    appStore.addNotification('Please fill in all fields', 'error');
    return;
  }

  const validateSelection = () => {
    if (!selection.value) {
      formFieldsErrorDetailsObject.value.selection = 'Please choose a need type';
      return false;
    }
    return true;
  };

  const validateDuration = () => {
    if (selection.value === 'duration' && valueOfSelection.value > 1440) {
      formFieldsErrorDetailsObject.value.durationValue = 'Duration cannot be over 1440 minutes';
      return false;
    }
    return true;
  };

  const validateQuantityUnit = () => {
    if (selection.value === 'quantity' && unitOfSelection.value === '') {
      formFieldsErrorDetailsObject.value.quantityUnit = 'Please select a unit';
      return false;
    }
    return true;
  };

  if (!validateSelection() || !validateDuration() || !validateQuantityUnit()) {
    setTimeout(() => {
      formFieldsErrorDetailsObject.value.selection = '';
      formFieldsErrorDetailsObject.value.durationValue = '';
      formFieldsErrorDetailsObject.value.quantityUnit = '';
    }, 5000);
    return;
  }

  const needObject: Need = {
    category: category.value,
    description: description.value,
    dateFor: currentDate.value,
    [selection.value]: {
      value: valueOfSelection.value,
      unit: unitOfSelection.value
    }
  };

  try {
    const response = await petStore.addNewNeed(pet.value.id, needObject);
    if (response) {
      setOpen(false);
      await getPet(pet.value.id);
    } else {
      appStore.addNotification('Failed to add need', 'error');
    }
  } catch (error) {
    appStore.addNotification('Failed to add need', 'error');
  }
};

watch(route, async () => {
  const id = route.params.id as string;
  if (id) {
    await getPet(id);
  }
});

// Watch the selection value and update the unitOfSelection value accordingly
watch(selection, (newValue) => {
  if (newValue === 'duration') {
    unitOfSelection.value = 'minutes';
  }
});

// Load the pet data from the store when the component is mounted
onBeforeMount(async () => {
  const id = route.params.id as string;
  if (id) {
    await getPet(id);
  }
});

// Function to handle the need deletion
const handleNeedDeleted = async (deleted: boolean) => {
  if (deleted) {
    await getPet(pet.value.id);
    appStore.addNotification('Need deleted successfully', 'success');
  }
};

// Provide the function to the child component
provide('isOwner', isOwner);
provide('handleNeedDeletion', handleNeedDeleted); // Provide the function to the child component

</script>

<style scoped>
  /* centering the content */
  .pet-container,
  .header-button-container,
  .date-navigation {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 100%;
  }

  .pet-container {
    margin-top: 30px;
  }

  .full-pet-card {
    background-color: var(--color-card-background-lilac);
    border-radius: 50px;
    border: 2px solid var(--color-card-border);
    box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
    padding: 20px;
    width: 100%;
    max-width: 650px;
  }

  .need-cards-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
  }

  /* Desktop specific styles */
  @media (min-width: 568px) {
    .date-navigation {
      flex-direction: row;
      justify-content: space-around;
    }
  }
</style>