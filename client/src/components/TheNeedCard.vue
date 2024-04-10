<template>
  <ion-card :class="{ 'is-expanded': showOptions, 'card-active': need.isActive, 'card-inactive': !need.isActive }">
    <ion-item class="custom-ion-item">
      <ion-label>
        <h4 class="ion-text-center need-card-field">{{ need.category }}</h4>
        <p class="need-card-field">Description: {{ need.description }}</p>
        <p class="need-card-field">{{ need.duration?.value || need.quantity?.value }} {{ need.duration?.unit || need.quantity?.unit }}</p>
      </ion-label>
    </ion-item>

    <div class="centering-container">
      <ion-item class="custom-ion-item">
        <ion-button class="complete-button" v-if="!need.completed && isTodayOrFuture" @click="addRecord(petId, need)">
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
      <ion-button v-if="isTodayOrFuture" @click="editNeed" fill="clear" class="option-button">
        <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
      </ion-button>
      <!-- isActive toggle button -->
      <div v-if="isTodayOrFuture">
        <ion-toggle v-if="!need.isActive" @ionChange="toggleNeedActive(need.id)"></ion-toggle>
        <ion-toggle v-else @ionChange="toggleNeedActive(need.id)" checked></ion-toggle>
      </div>
      <!-- delete need button -->
      <ion-button @click="confirmDeleteNeed(need.id)" fill="clear" class="option-button">
        <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
      </ion-button>
    </div>

    <!-- Edit Need Modal -->
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
        <ion-item>
          <ion-label class="custom-label" position="stacked">Category</ion-label>
          <ion-input v-model="editForm.category" placeholder="Enter need category" aria-label="Category"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label class="custom-label" position="stacked">Description</ion-label>
          <ion-input v-model="editForm.description" placeholder="Enter need description" aria-label="Description"></ion-input>
        </ion-item>
        <ion-item v-if="editForm.type === 'quantity'">
          <ion-label class="custom-label" position="stacked">Quantity</ion-label>
          <ion-input v-model="editForm.value" placeholder="Enter quantity" aria-label="Quantity"></ion-input>
          <ion-select v-model="editForm.unit" placeholder="Select unit" aria-label="Unit">
            <ion-select-option value="ml">ml</ion-select-option>
            <ion-select-option value="g">g</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item v-else>
          <ion-label class="custom-label" position="stacked">Duration</ion-label>
          <div style="display: inline-flex;">
            <ion-input v-model="editForm.value" placeholder="Enter duration" aria-label="Duration"></ion-input>
            <ion-input style="text-align: end; width: fit-content;" v-model="editForm.unit" placeholder="Unit" readonly value="minutes"
              aria-label="Minutes"></ion-input>
          </div>
        </ion-item>
        <ion-button class="custom-button" @click="updateNeed">Update Need</ion-button>
      </ion-content>
    </ion-modal>

    <ion-item class="custom-ion-item" v-if="errorMessage">
      <ion-label class="custom-error-message">{{ errorMessage }}</ion-label>
    </ion-item>
    <ion-item class="custom-ion-item" v-if="validMessage">
      <ion-label class="custom-valid-message">{{ validMessage }}</ion-label>
    </ion-item>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonItem, IonLabel, IonButtons, IonButton, IonIcon, IonToggle, IonSelect, IonInput, IonSelectOption, IonModal, IonHeader, IonContent, IonTitle, IonToolbar } from '@ionic/vue';
import { defineProps, ref, computed, inject, onBeforeMount } from 'vue';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import { Need, QuantityRecord, DurationRecord } from '@/types/pet';
import { trashOutline, ellipsisVerticalOutline, checkmarkDone, checkmark, pencil } from 'ionicons/icons';
import moment from 'moment-timezone';
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

onBeforeMount(() => {
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



const showOptions = ref(false);

type HandleNeedDeletionFunction = (needDelete: boolean) => void;

const errorMessage = ref('');
const validMessage = ref('');
const reactiveNeed = ref(need);

const handleNeedDeletion = inject<HandleNeedDeletionFunction>('handleNeedDeletion'); // This function sends a signal to the parent component that a need has been deleted
const isOwner = inject('isOwner'); // This value comes from the parent component

// Check if the need is for today or in the future
const isTodayOrFuture = computed(() => {
  const needDate = moment(need.dateFor).tz(userStore.timezone);
  const today = moment().tz(userStore.timezone);
  return needDate.isSameOrAfter(today, 'day');
});

// Add Record (need done) -button click event handler
const addRecord = async (petId: string, need: Need) => {
  const needId = need.id;
  const isDuration = !!need.duration;

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
const toggleOptions = () => {
  if (!isOwner) {
    return;
  }
  showOptions.value = !showOptions.value;
};

const editNeed = () => {
  isEditModalOpen.value = true;

  editForm.value = { category: need.category, description: need.description, ...editForm.value };
};


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
  border-radius: 35px;
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
  /* Dim text/icons within the card */
}


/* Remove bottom border */
ion-item.custom-ion-item {
  --border-color: transparent;
  --inner-border-color: transparent;
}

.custom-model-input {
  --inner-border-color: none !important;
}

ion-label h5,
ion-label p {
  margin: 0;
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



/* Modal styles */
ion-modal {
  --width: 95%;
  --max-height: 500px;
  --max-width: 500px;
  --background: var(--color-card-background-lilac);
  --border-radius: 50px;
}

ion-modal ion-header {
  --background: var(--color-primary-pink);
}

ion-modal ion-content {
  --background: var(--color-modal-content-background);
}

ion-modal ion-item {
  --padding-start: 0;
  --padding-end: 0;
  margin-bottom: 10px;
}

ion-modal ion-input,
ion-modal ion-select {
  --padding-start: 10px;
  --padding-end: 10px;
  --background: var(--color-input-background);
  --border-radius: 15px;
  --placeholder-color: var(--color-text-placeholder);
}

ion-modal ion-select-option {
  --color: var(--color-option-text);
  --background: var(--color-option-background);
  --ion-item-background: var(--color-option-background);
}


ion-modal ion-title {
  color: var(--color-text-lilac);
}


/* Mobile styles */
@media (max-width: 568px) {

  .complete-button,
  .done-label {
    font-size: 0.70rem;
  }

  .done-label {
    margin-right: 20px;
  }

  .custom-label {
    font-size: 1rem !important;
    color: var(--color-text-lilac);
  }

  .custom-button {
    font-size: 0.6rem !important;
  }


}
</style>