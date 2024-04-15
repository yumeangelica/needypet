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
        <ion-item v-for="(zone, index) in filteredTimezones" :key="index" @click="selectTimezone(zone)">
          {{ zone }}
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup lang='ts'>
import { ref, computed, onBeforeMount, defineAsyncComponent } from 'vue';
import { useAppStore } from '@/store/app';
// Lazy load the components for better performance
const IonModal = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonModal));
const IonHeader = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonHeader));
const IonToolbar = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonToolbar));
const IonTitle = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonTitle));
const IonButtons = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButtons));
const IonButton = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButton));
const IonSearchbar = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonSearchbar));
const IonContent = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonContent));
const IonList = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonList));
const IonItem = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonItem));

const appStore = useAppStore();

const { isOpen } = defineProps({
  isOpen: Boolean
});

const timezones = ref([]);

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

const selectTimezone = (zone) => {
  emit('timezoneSelected', zone);
  searchQuery.value = '';
  closeModal();
};
</script>