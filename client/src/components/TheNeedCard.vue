<template>
  <ion-card>
    <ion-item>
      <ion-label>
        <h2>{{ need.category }}</h2>
        <p>{{ need.description }}</p>
        <p>{{ need.duration?.value || need.quantity?.value }} {{ need.duration?.unit || need.quantity?.unit }}</p>
      </ion-label>
      <ion-button class="complete-button" v-if="!need.completed" @click="addRecord(petId as string, need as Need)">Complete</ion-button>
      <div class="done-label" v-else>Done!</div>
    </ion-item>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonItem, IonLabel, IonButton } from '@ionic/vue';
import { defineProps, ref } from 'vue';
import { usePetStore } from '@/store/pet';
import { Need, QuantityRecord, DurationRecord } from '@/types/pet';
const petStore = usePetStore();

const { need, petId } = defineProps<{
  need: Need,
  petId: string
}>();

const reactiveNeed = ref(need);

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
        value: need.duration!.value,
        unit: need.duration!.unit
      }
    };
  } else {
    recordObject = {
      ...recordObject,
      quantity: {
        value: need.quantity!.value,
        unit: need.quantity!.unit
      }
    };
  }


  const updateSuccessful = await petStore.addRecord(petId, needId, recordObject);
  if (updateSuccessful) {
    reactiveNeed.value.completed = true;
  }
};

</script>


<style scoped>
ion-card {
  border-radius: 20px;
  background: var(--color-pet-need-background);
}

.done-label {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  white-space: normal;
  margin-right: 10px;
  padding: 10px 0px;
  border: 1px solid var(--color-done-border);
  border-radius: 20px;
  color: #fff;
  background-color: var(--color-status-done) !important;
  font-weight: bold;
  background: var(--color-done-background);
  box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
  width: 80px;
  font-size: calc(0.70rem + 0.15vw);
}

.complete-button {
  --background: var(--color-button-pet-page);
  --border-radius: 20px;
  --box-shadow: 1px 1px 2px var(--color-drop-shadow-pink);
  font-size: calc(0.55rem + 0.15vw);
  width: 100px;
  min-height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  white-space: normal;
  padding: 5px;
}

.complete-button:hover {
  --box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
}
</style>
