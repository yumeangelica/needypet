<template>
  <ion-modal :is-open="isOpen">
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Select Timezone</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-searchbar v-model="searchQuery"></ion-searchbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item class="timezone-selector-field" v-for="(zone, index) in filteredTimezones" :key="index" @click="selectTimezone(zone)">
          {{ zone }}
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup lang='ts'>
import { ref, computed, onBeforeMount, Ref } from 'vue';
import { useAppStore } from '@/store/app';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSearchbar, IonContent, IonList, IonItem } from '@ionic/vue';

const appStore = useAppStore();

const { isOpen } = defineProps({
  isOpen: Boolean
});

const timezones: Ref<string[]> = ref([]);

onBeforeMount(async () => {
  timezones.value = await appStore.getTimezones();
});

const emit = defineEmits(['update:isOpen', 'timezoneSelected']);

const searchQuery = ref('');

const filteredTimezones = computed(() => {
  return timezones.value.filter(zone => zone.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const closeModal = () => {
  emit('update:isOpen', false);
};

const selectTimezone = (zone: string) => {
  emit('timezoneSelected', zone);
  searchQuery.value = '';
  closeModal();
};
</script>