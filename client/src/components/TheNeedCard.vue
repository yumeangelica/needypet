<template>
  <ion-card :class="{ 'is-expanded': showOptions }">
    <ion-item>
      <ion-label>
        <h5>{{ need.category }}</h5>
        <p>{{ need.description }}</p>
        <p>{{ need.duration?.value || need.quantity?.value }} {{ need.duration?.unit || need.quantity?.unit }}</p>
      </ion-label>
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
    <div v-if="isOwner" class="options-container" :class="{ 'visible': showOptions }">
      <ion-button @click="editNeed(need.id)" fill="clear" class="option-button">
        <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
      </ion-button>
      <ion-toggle v-if="!need.isActive" @ionChange="toggleNeed(need.id)"></ion-toggle>
      <ion-toggle v-else @ionChange="toggleNeed(need.id)" checked></ion-toggle>
      <ion-button @click="confirmDeleteNeed(need.id)" fill="clear" class="option-button">
        <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
      </ion-button>
    </div>
    <ion-item v-if="errorMessage">
      <ion-label class="custom-error-message">{{ errorMessage }}</ion-label>
    </ion-item>
    <ion-item v-if="validMessage">
      <ion-label class="custom-valid-message">{{ validMessage }}</ion-label>
    </ion-item>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonItem, IonLabel, IonButton, IonIcon, IonToggle } from '@ionic/vue';
import { defineProps, ref, computed, inject } from 'vue';
import { usePetStore } from '@/store/pet';
import { Need, QuantityRecord, DurationRecord } from '@/types/pet';
import { trashOutline, ellipsisVerticalOutline, checkmarkDone, checkmark, pencil } from 'ionicons/icons';
import moment from 'moment-timezone';
const petStore = usePetStore();

const { need, petId } = defineProps<{
  need: Need,
  petId: string
}>();

const isOwner = ref(false);

const showOptions = ref(false);

type HandleNeedDeletionFunction = (needDelete: boolean) => void;

const errorMessage = ref('');
const validMessage = ref('');
const reactiveNeed = ref(need);

const handleNeedDeletion = inject<HandleNeedDeletionFunction>('handleNeedDeletion'); // This function sends a signal to the parent component that a need has been deleted
isOwner.value = inject('isOwner'); // This value comes from the parent component

const isTodayOrFuture = computed(() => {
  const today = moment().startOf('day');
  const needDate = moment(need.dateFor).startOf('day');
  return needDate.isSame(today) || needDate.isAfter(today);
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
  if (!isOwner.value) {
    return;
  }
  showOptions.value = !showOptions.value;
};

// Initialize editing of a need
const editNeed = (needId) => {
  if (!needId || !isOwner.value) {
    return;
  }

};

// Initialize toggling of a need
const toggleNeed = (needId) => {
  if (!needId || !isOwner.value) {
    return;
  }
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
ion-card {
  border-radius: 35px;
  background: var(--color-pet-need-background);
  width: 100%;
  margin: 4px 0;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
}

/* Remove bottom border */
ion-item {
  --border-color: transparent;
  --inner-border-color: transparent;
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

/* Mobile styles */
@media (max-width: 568px) {

  .complete-button,
  .done-label {
    font-size: 0.60rem;
  }

  .done-label {
    margin-right: 20px;
  }
}
</style>