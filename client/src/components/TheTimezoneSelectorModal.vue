<template>
  <Dialog :open="isOpen" @update:open="(v) => { if (!v) closeModal(); }" title="Select Timezone"
    description="Search and select your timezone">
    <div class="mb-4">
      <input ref="inputField" v-model="searchQuery" placeholder="Search for timezone..." aria-label="Search for timezone"
        class="form-field-input timezone-search-input" />
    </div>
    <ul class="timezone-list max-h-[400px] overflow-y-auto">
      <li v-for="zone in filteredTimezones" :key="zone">
        <button type="button" class="timezone-option" @click="selectTimezone(zone)">
          {{ zone }}
        </button>
      </li>
    </ul>
  </Dialog>
</template>

<script setup lang='ts'>
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import { Dialog } from '@/components/ui';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();

const { isOpen } = defineProps<{
  isOpen: boolean;
}>();

const timezones = ref<string[]>([]);

onBeforeMount(async () => {
  timezones.value = await appStore.getTimezones();
});

const emit = defineEmits(['update:isOpen', 'timezoneSelected']);

const searchQuery = ref('');
const inputField = ref<HTMLInputElement | null>(null);

const filteredTimezones = computed(() => {
  return timezones.value.filter((zone) =>
    zone.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
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

watch(
  () => isOpen,
  (newVal) => {
    if (newVal) {
      focusInput();
    }
  },
);
</script>

<style scoped>
.timezone-list {
  max-height: min(400px, calc(100svh - 14rem));
}

.timezone-search-input {
  min-height: 50px;
}

.timezone-list li {
  margin-bottom: 0.25rem;
}

.timezone-option {
  width: 100%;
  min-height: 40px;
  padding: 0.55rem 0.75rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-foreground);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.35;
  text-align: left;
  overflow-wrap: anywhere;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.timezone-option:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

@media (hover: hover) {
  .timezone-option:hover {
    border-color: var(--color-border-soft);
    background: var(--color-surface-control);
  }
}

.timezone-option:active {
  transform: scale(0.99);
}
</style>
