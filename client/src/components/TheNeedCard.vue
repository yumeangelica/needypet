<template>
  <ion-card :class="{ 'is-expanded': showOptions, 'card-active': need.isActive, 'card-inactive': !need.isActive }">
    <ion-item class="custom-ion-item">
      <ion-label>
        <h5 class="ion-text-center need-card-field">{{ need.category }}</h5>
        <p class="need-card-field">Description: {{ need.description }}</p>
        <p class="need-card-field">{{ need.duration?.value || need.quantity?.value }} {{ need.duration?.unit || need.quantity?.unit }}</p>
      </ion-label>
    </ion-item>

    <div class="centering-container">
      <ion-item class="custom-ion-item">
        <ion-button class="complete-button" v-if="!need.completed && isToday" @click="addRecord(petId, need)">
          <ion-icon :icon="checkmark"></ion-icon>Complete</ion-button>
        <div class="done-label" v-if="need.completed">
          <ion-icon :icon="checkmarkDone"></ion-icon>
          Done
        </div>

        <ion-button v-if="isOwner" fill="clear" @click="toggleOptions">
          <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
        </ion-button>
      </ion-item>
    </div>

    <!-- Toggleable buttons -->
    <div v-if="isOwner" class="options-container" :class="{ 'visible': showOptions }">
      <!-- Edit need button -->
      <ion-button v-if="isToday || isFuture" @click="editNeed" fill="clear" class="option-button">
        <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
      </ion-button>
      <!-- isActive toggle button -->
      <div v-if="isToday || isFuture">
        <ion-toggle v-if="!need.isActive" @ionChange="toggleNeedActive(need.id)"></ion-toggle>
        <ion-toggle v-else @ionChange="toggleNeedActive(need.id)" checked></ion-toggle>
      </div>
      <!-- delete need button -->
      <ion-button @click="confirmDeleteNeed(need.id)" fill="clear" class="option-button">
        <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
      </ion-button>
    </div>

    <!-- Edit need modal -->
    <ion-modal :is-open="isEditModalOpen">
      <ion-header translucent>
        <ion-toolbar>
          <ion-title>Edit Need</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <form @submit.prevent="updateNeed">
          <ion-item>
            <ion-label position="stacked" class="custom-label" aria-label="Category">Category</ion-label>
            <ion-input v-model="editForm.category" required type="text" placeholder="Enter need category" aria-label="Need category"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked" class="custom-label" aria-label="Description">Description</ion-label>
            <ion-input v-model="editForm.description" required type="text" placeholder="Enter need description"
              aria-label="Need description"></ion-input>
          </ion-item>

          <ion-item v-if="editForm.type === 'quantity'">
            <ion-label position="stacked" class="custom-label" aria-label="Quantity">Quantity</ion-label>
            <ion-input v-model="editForm.value" type="number" placeholder="Enter quantity" required aria-label="Quantity"></ion-input>

            <ion-label position="stacked" class="custom-label" aria-label="Unit selection">Select unit</ion-label>
            <ion-select v-model="editForm.unit" placeholder="Select unit" required aria-label="Unit">
              <ion-select-option value="ml">ml</ion-select-option>
              <ion-select-option value="g">g</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item v-else>
            <div style="display: flex; align-items: center;">
              <ion-input v-model="editForm.value" type="number" placeholder="Enter duration" required aria-label="Duration"></ion-input>
              <ion-label>minute(s)</ion-label>
            </div>
          </ion-item>
          <div class="confirm-button-container">
            <ion-button type="submit" class="custom-button">Update Need</ion-button>
          </div>
        </form>
      </ion-content>
    </ion-modal>


    <!-- Error and success messages -->
    <ion-item class="custom-ion-item" v-if="errorMessage">
      <ion-label class="custom-error-message">{{ errorMessage }}</ion-label>
    </ion-item>
    <ion-item class="custom-ion-item" v-if="validMessage">
      <ion-label class="custom-valid-message">{{ validMessage }}</ion-label>
    </ion-item>
  </ion-card>
</template>

<script setup lang="ts">
import { defineProps, ref, computed, inject, onBeforeMount } from 'vue';
import { trashOutline, ellipsisVerticalOutline, checkmarkDone, checkmark, pencil } from 'ionicons/icons';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import { Need, QuantityRecord, DurationRecord } from '@/types/pet';
import moment from 'moment-timezone';
import { IonButton, IonCard, IonContent, IonIcon, IonItem, IonLabel, IonModal, IonSelect, IonSelectOption, IonToggle, IonInput, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/vue';

const petStore = usePetStore();
const userStore = useUserStore();

const { need, petId } = defineProps<{
  need: Need,
  petId: string
}>();

const isEditModalOpen = ref(false);
const editForm = ref({
  category: '' as string,
  description: '' as string,
  value: 0 as number,
  unit: '' as string,
  type: '' as 'quantity' | 'duration',
});

onBeforeMount(async () => {
  if (need.quantity) {
    editForm.value = {
      category: need.category,
      description: need.description,
      value: need.quantity.value,
      unit: need.quantity.unit,
      type: 'quantity',
    };
  } else if (need.duration) {
    editForm.value = {
      category: need.category,
      description: need.description,
      value: need.duration.value,
      unit: need.duration.unit,
      type: 'duration',
    };
  }
});


type HandleNeedDeletionType = (needDelete: boolean) => void;

const showOptions = ref(false);
const errorMessage = ref('');
const validMessage = ref('');
const reactiveNeed = ref(need);

const handleNeedDeletion = inject<HandleNeedDeletionType>('handleNeedDeletion'); // This function sends a signal to the parent component that a need has been deleted
const isOwner = inject('isOwner'); // This value comes from the parent component

// Check if the need is for today or in the future
const isFuture = computed(() => {
  const needDate = moment(need.dateFor).tz(userStore.timezone);
  const today = moment().tz(userStore.timezone);
  return needDate?.isAfter(today, 'day');
});

// Check if the need is for today
const isToday = computed(() => {
  const needDate = moment(need.dateFor).tz(userStore.timezone);
  const today = moment().tz(userStore.timezone);
  return needDate?.isSame(today, 'day');
});

// Add Record (need done) -button click event handler
const addRecord = async (petId: string, need: Need) => {
  const needId = need.id;
  const isDuration = need.duration ? true : false;

  let recordObject = {
    note: '',
  } as QuantityRecord | DurationRecord;

  if (isDuration) {
    recordObject = {
      ...recordObject,
      duration: {
        value: need.duration?.value,
        unit: need.duration?.unit
      }
    };
  } else {
    recordObject = {
      ...recordObject,
      quantity: {
        value: need.quantity?.value,
        unit: need.quantity?.unit
      }
    };
  }

  const updateSuccessful = await petStore.addRecord(petId, needId, recordObject);
  if (updateSuccessful) {
    reactiveNeed.value.completed = true;
    validMessage.value = 'Record added successfully';
    setTimeout(() => {
      validMessage.value = '';
    }, 5000);
  } else {
    errorMessage.value = 'Failed to add record';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
};

// Toggle options visibility
const toggleOptions = () => {
  if (!isOwner) {
    return;
  }
  showOptions.value = !showOptions.value;
};

// Open edit need modal
const editNeed = () => {
  isEditModalOpen.value = true;
  editForm.value = { category: need.category, description: need.description, ...editForm.value };
};

// Toggle need active status
const toggleNeedActive = async (needId) => {
  if (!needId || !isOwner) {
    return;
  }

  const response = await petStore.toggleNeedisActive(petId, needId);
  if (response) {
    validMessage.value = 'Need active status toggled successfully';
    setTimeout(() => {
      validMessage.value = '';
    }, 5000);
  } else {
    errorMessage.value = 'Failed to toggle need active status';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
};


const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const updateNeed = async () => {
  if (!editForm.value.category || !editForm.value.description || !editForm.value.value || !editForm.value.unit) {
    errorMessage.value = 'Please fill all fields';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
    return;
  }

  const needId = need.id;

  const updatedNeed = {
    category: editForm.value.category,
    description: editForm.value.description,
    [editForm.value.type]: {
      value: editForm.value.value,
      unit: editForm.value.unit
    }
  };
  const response = await petStore.updateNeed(petId, needId, updatedNeed); // Implement this in your petStore

  if (response) {
    validMessage.value = 'Need updated successfully';
    setTimeout(() => {
      validMessage.value = '';
    }, 5000);
  } else {
    errorMessage.value = 'Failed to update need';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
  closeEditModal();
};

// Confirm deletion of a need
const confirmDeleteNeed = (needId: string) => {
  if (confirm('Are you sure you want to delete this need?')) {
    deleteNeed(needId);
  }
};

const deleteNeed = async (needId: string) => {

  if (!needId) {
    return;
  }

  const response = await petStore.deleteNeed(petId, needId);
  if (response) {
    handleNeedDeletion(true); // Send signal to parent component that a need has been deleted
  } else {
    errorMessage.value = 'Failed to delete need';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
};

</script>


<style scoped>
  .need-card-field {
    margin-top: 10px;
  }

  .centering-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }

  ion-card {
    border-radius: 40px;
    background: var(--color-pet-need-background);
    width: 100%;
    max-width: 350px;
    margin: 4px 0;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
  }

  .card-active {
    background: var(--color-pet-need-background);
  }

  .card-active {
    background: var(--color-pet-need-background);
  }

  .card-inactive {
    background: #ded7e0;
    color: #a0a0a0;
    border: 1px solid #d0d0d0;
    opacity: 0.8;
    transition: background 0.3s ease-in-out, color 0.3s ease-in-out;
  }

  /* Additional styling for child elements in the inactive card to enhance the inactive look */
  .card-inactive ion-label,
  .card-inactive .complete-button,
  .card-inactive .done-label,
  .card-inactive .option-button {
    color: #afa8a8;
  }


  /* Remove bottom border */
  ion-item.custom-ion-item {
    --border-color: transparent;
    --inner-border-color: transparent;
  }

  .custom-model-input {
    --inner-border-color: none !important;
  }

  .complete-button,
  .done-label {
    --background: var(--color-button-pet-page);
    --border-radius: 15px;
    padding: 4px 10px;
    font-size: 0.8rem;
  }

  .done-label {
    background-color: var(--color-status-done);
    color: var(--color-text-default);
    border-radius: 15px;
    text-align: center;
    min-width: 60px;
    margin-right: 28px;
  }

  .options-container {
    gap: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    height: 0;
    opacity: 0;
    transition: height 0.3s ease, opacity 0.3s ease;
  }

  .is-expanded .options-container {
    height: 50px;
    opacity: 1;
  }

  /* Mobile styles */
  @media (max-width: 568px) {

    .complete-button,
    .done-label {
      font-size: 0.70rem;
      padding-right: 20px;
      padding-left: 5px;
    }

    /* Edit need modal styles */
    .custom-label {
      font-size: 1rem !important;
      color: var(--color-text-lilac);
    }

    .custom-button {
      font-size: 0.6rem !important;
    }
  }
</style>