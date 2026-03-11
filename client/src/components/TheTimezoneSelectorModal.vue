<template>
  <Dialog :open="isOpen" @update:open="(v) => { if (!v) closeModal(); }" title="Select Timezone">
    <div class="mb-4">
      <input
        ref="inputField"
        v-model="searchQuery"
        placeholder="Search for timezone..."
        class="w-full p-3 text-sm rounded-xl bg-auth-input-bg border border-card-border outline-none font-sans text-foreground"
      />
    </div>
    <ul class="max-h-[400px] overflow-y-auto">
      <li
        v-for="(zone, index) in filteredTimezones"
        :key="index"
        @click="selectTimezone(zone)"
        class="px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-card text-sm font-sans text-foreground"
      >
        {{ zone }}
      </li>
    </ul>
  </Dialog>
</template>

<script setup lang='ts'>
import { ref, computed, onBeforeMount, nextTick, watch } from 'vue';
import { useAppStore } from '@/store/app';
import { Dialog } from '@/components/ui';

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
  await nextTick();
  if (inputField.value) {
    inputField.value.focus();
  }
};

watch(() => isOpen,
  (newVal) => {
    if (newVal) {
      focusInput();
    }
  }
);
</script>
