<template>
  <ion-card>
    <ion-item>
      <ion-label>
          <h2>{{ need.category }}</h2>
          <p>{{ need.description }}</p>
          <p>{{ need.duration?.value || need.quantity?.value }} {{ need.duration?.unit || need.quantity?.unit }}</p>
      </ion-label>
      <ion-button class="record-btn" v-if="!need.completed" @click="addRecord(petId as string, need as Need)">Add Record</ion-button>
      <ion-label class="done-label" v-else>Done</ion-label>
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
}
.done-label {
  color: rgb(70, 194, 225);
  font-weight: bold;
}

.record-btn {
  --background: var(--ion-color-pink);
  --border-radius: 20px;
}
</style>
