<template>
  <ion-modal :is-open="isOpen" @ionModalDidPresent="focusInput">
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Select Timezone</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <div class="ion-padding">
        <input ref="inputField" v-model="searchQuery" placeholder="Search for timezone..." class="custom-searchbar" />
      </div>
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
import { ref, computed, onBeforeMount, nextTick, watch } from 'vue';
import { useAppStore } from '@/store/app';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem } from '@ionic/vue';

const appStore = useAppStore();

const { isOpen } = defineProps({
  isOpen: Boolean
});

const timezones = ref<string[]>([]);

onBeforeMount(async () => {
  timezones.value = await appStore.getTimezones();
});

const emit = defineEmits(['update:isOpen', 'timezoneSelected']);

const searchQuery = ref('');
const inputField = ref<HTMLInputElement | null>(null);

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

const focusInput = async () => {
  await nextTick();  // Ensure the DOM is updated before accessing the element
  if (inputField.value) {
    inputField.value.focus();
  }
};

// Automatically focus the input field when the modal is presented
watch(() => isOpen,
  (newVal) => {
    if (newVal) {
      focusInput();
    }
  }
);
</script>

<style scoped>
.custom-searchbar {
  width: 100%;
  padding: 12px;
  font-size: 0.95rem;
  color: var(--color-text-default);
  background-color: var(--color-input-background);
  border: 1px solid var(--color-card-border);
  border-radius: 20px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  outline: none; /* Remove the focus outline */
}

.custom-searchbar:focus {
  outline: none; /* Ensures no outline on focus */
  border-color: var(--color-card-border); /* Optional: Keep the border color consistent on focus */
}

.custom-searchbar::placeholder {
  color: var(--color-text-placeholder);
  opacity: 0.8;
}

</style>

