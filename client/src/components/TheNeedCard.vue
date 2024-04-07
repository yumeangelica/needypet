<template>
  <ion-card>
    <ion-item>
      <ion-label>
        <h2>{{ need.category }}</h2>
        <p>{{ need.description }}</p>
        <p>{{ need.duration?.value || need.quantity?.value }} {{ need.duration?.unit || need.quantity?.unit }}</p>
      </ion-label>
      <ion-button class="complete-button" v-if="!need.completed && isTodayOrFuture" @click="addRecord(petId, need)">Complete</ion-button>
      <div class="done-label" v-if="need.completed">Done!</div>
    </ion-item>
    <ion-item v-if="errorMessage">
      <ion-label class="custom-error-message">{{ errorMessage }}</ion-label>
    </ion-item>
    <ion-item v-if="validMessage">
      <ion-label class="custom-valid-message">{{ validMessage }}</ion-label>
    </ion-item>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonItem, IonLabel, IonButton } from '@ionic/vue';
import { defineProps, ref, computed } from 'vue';
import { usePetStore } from '@/store/pet';
import { Need, QuantityRecord, DurationRecord } from '@/types/pet';
import moment from 'moment-timezone';
const petStore = usePetStore();

const { need, petId } = defineProps<{
  need: Need,
  petId: string
}>();
const errorMessage = ref('');
const validMessage = ref('');
const reactiveNeed = ref(need);

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

</script>


<style scoped>
ion-card {
  border-radius: 20px;
  background: var(--color-pet-need-background);
  width: 100%;
  margin: 4px 0;
  padding-left: 10px;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  --border-color: transparent;
  --inner-border-color: transparent;
  --background: transparent;
}

ion-label h2,
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
  margin-right: 20px;
}

/* Mobile styles */
@media (max-width: 768px) {

  ion-label h2,
  ion-label p {
    font-size: 0.65rem;
    padding: 2px 8px;
  }

  .complete-button,
  .done-label {
    padding: 2px 8px;
    font-size: 0.55rem;
  }
}

.custom-error-message {
  color: var(--color-error-message);
  font-size: 0.8rem;
  text-align: center;
}
.custom-valid-message {
  color: var(--color-valid-message);
  font-size: 0.8rem;
  text-align: center;
}
</style>