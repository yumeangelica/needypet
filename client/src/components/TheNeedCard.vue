<template>
  <div class="need-card" :class="{ 'is-expanded': showOptions, 'card-inactive': !need.isActive }">
    <div class="text-center">
      <h5 class="need-card-category">{{ need.category }}</h5>
      <p class="need-card-description">{{ need.description }}</p>
      <p class="need-card-field">{{ need.duration?.value || need.quantity?.value }} {{ need.duration?.unit || need.quantity?.unit }}</p>
    </div>

    <div class="flex justify-center items-center gap-2">
      <button class="complete-button" v-if="!need.completed && isToday" :disabled="isSaving" @click="addRecord(petId, need)">
        <Check class="size-4" />Complete
      </button>
      <div class="done-label" v-if="need.completed">
        <CheckCheck class="size-4" />
        Done
      </div>

      <button v-if="isOwner"
        class="bg-transparent border-none cursor-pointer text-primary-foreground p-1 rounded-full transition-colors hover:bg-black/10 active:bg-black/15"
        @click="toggleOptions">
        <EllipsisVertical class="size-5" />
      </button>
    </div>

    <!-- Toggleable buttons -->
    <div v-if="isOwner" class="options-container">
      <!-- Edit need button -->
      <button v-if="isToday || isFuture" @click="editNeed"
        class="bg-transparent border-none cursor-pointer text-primary-foreground p-1.5 rounded-full transition-colors hover:bg-black/10 active:bg-black/15">
        <Pencil class="size-5" />
      </button>

      <!-- isActive toggle -->
      <div v-if="isToday || isFuture" class="flex flex-col items-center">
        <span class="text-sm text-primary-foreground block mb-1">
          {{ need.isActive ? 'Active' : 'Inactive' }}
        </span>
      <Switch :checked="need.isActive" @update:checked="toggleNeedActive(need.id)" />
      </div>

      <!-- Delete need button -->
      <button @click="showDeleteConfirm = true"
        class="bg-transparent border-none cursor-pointer text-primary-foreground p-1.5 rounded-full transition-colors hover:bg-red-500/15 active:bg-red-500/25">
        <Trash2 class="size-5" />
      </button>
    </div>

    <!-- Delete confirmation dialog — only rendered when needed -->
    <AlertDialog v-if="showDeleteConfirm" :open="showDeleteConfirm" title="Delete Need" message="Are you sure you want to delete this need?"
      confirmLabel="Delete" cancelLabel="Cancel" variant="danger" @confirm="deleteNeed(need.id); showDeleteConfirm = false"
      @cancel="showDeleteConfirm = false" />

    <!-- Edit need modal — only rendered when needed -->
    <Dialog v-if="isEditModalOpen" :open="isEditModalOpen" @update:open="(v) => { if (!v) closeEditModal(); }" title="Edit Need" maxWidth="520px">
      <form @submit.prevent="updateNeed">
        <label class="form-label" :for="categoryId">Category</label>
        <input :id="categoryId" v-model="editForm.category" required type="text" placeholder="Enter need category" class="form-field-item" />

        <label class="form-label" :for="descriptionId">Description</label>
        <input :id="descriptionId" v-model="editForm.description" required type="text" placeholder="Enter need description" class="form-field-item" />

        <div v-if="editForm.type === 'quantity'">
          <label class="form-label" :for="valueId">Quantity</label>
          <input :id="valueId" v-model="editForm.value" type="number" placeholder="Enter quantity" required class="form-field-item" />

          <label class="form-label">Select unit</label>
          <Select :modelValue="editForm.unit" @update:modelValue="(v) => editForm.unit = v" placeholder="Select unit" aria-label="Unit"
            :options="[{ value: 'ml', label: 'ml' }, { value: 'g', label: 'g' }]" />
        </div>

        <div v-else>
          <label class="form-label" :for="valueId">Duration</label>
          <div class="flex items-center gap-2">
            <input :id="valueId" v-model="editForm.value" type="number" placeholder="Enter duration" required class="form-field-item" />
            <span class="text-sm text-foreground">minute(s)</span>
          </div>
        </div>

        <div class="flex justify-center mt-4">
          <button type="submit" class="custom-button">Update Need</button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Check, CheckCheck, EllipsisVertical, Pencil, Trash2 } from '@lucide/vue';
import { computed, inject, onBeforeMount, type Ref, ref, useId } from 'vue';
import { AlertDialog, Dialog, Select, Switch } from '@/components/ui';
import { resultMessage } from '@/lib/apiError';
import dayjs from '@/lib/dayjs';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import type { DurationRecord, Need, QuantityRecord } from '@/types/pet';

const petStore = usePetStore();
const userStore = useUserStore();
const appStore = useAppStore();

const { need, petId } = defineProps<{
  need: Need;
  petId: string;
}>();

const emit = defineEmits(['needDeleted', 'needUpdated']);

// Unique ids to associate the edit-form labels with their inputs (per card instance)
const categoryId = useId();
const descriptionId = useId();
const valueId = useId();

const isEditModalOpen = ref(false);
const showDeleteConfirm = ref(false);
const editForm = ref({
  category: '' as string,
  description: '' as string,
  value: 0 as number,
  unit: '' as string,
  type: '' as 'quantity' | 'duration',
});

onBeforeMount(async () => {
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

type HandleNeedDeletionType = (needDelete: boolean) => void;

const showOptions = ref(false);

const handleNeedDeletion = inject<HandleNeedDeletionType>('handleNeedDeletion');
const isOwner = inject<Ref<boolean>>('isOwner', ref(false));

const isFuture = computed(() => {
  const needDate = dayjs(need.dateFor).tz(userStore.timezone);
  const today = dayjs().tz(userStore.timezone);
  return needDate?.isAfter(today, 'day');
});

const isToday = computed(() => {
  const needDate = dayjs(need.dateFor).tz(userStore.timezone);
  const today = dayjs().tz(userStore.timezone);
  return needDate?.isSame(today, 'day');
});

const isSaving = ref(false);

const addRecord = async (petId: string, need: Need) => {
  if (isSaving.value) return;
  if (!need.id) return;
  isSaving.value = true;
  const needId = need.id;

  let recordObject: QuantityRecord | DurationRecord;

  if (need.duration) {
    recordObject = {
      note: '',
      duration: {
        value: need.duration.value,
        unit: need.duration.unit,
      },
    };
  } else if (need.quantity) {
    recordObject = {
      note: '',
      quantity: {
        value: need.quantity.value,
        unit: need.quantity.unit,
      },
    };
  } else {
    isSaving.value = false;
    return;
  }

  const result = await petStore.addRecord(petId, needId, recordObject);
  if (result.isSuccess) {
    appStore.addNotification('Need completed! ✓', 'success');
  } else {
    appStore.addNotification(result.message || 'Failed to add record', 'error');
  }
  isSaving.value = false;
};

const toggleOptions = () => {
  if (!isOwner.value) return;
  showOptions.value = !showOptions.value;
};

const editNeed = () => {
  isEditModalOpen.value = true;
  editForm.value = { ...editForm.value, category: need.category, description: need.description };
};

const toggleNeedActive = async (needId?: string) => {
  if (!needId || !isOwner.value) return;

  const result = await petStore.toggleNeedisActive(petId, needId);
  if (result.isSuccess) {
    emit('needUpdated');
    appStore.addNotification('Need active status toggled successfully', 'success');
  } else {
    appStore.addNotification(result.message || 'Failed to toggle need active status', 'error');
  }
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const updateNeed = async () => {
  if (
    !editForm.value.category ||
    !editForm.value.description ||
    !editForm.value.value ||
    !editForm.value.unit
  ) {
    appStore.addNotification('Please fill all fields', 'error');
    return;
  }

  const needId = need.id;
  if (!needId) return;

  const updatedNeed = {
    category: editForm.value.category,
    description: editForm.value.description,
    [editForm.value.type]: {
      value: editForm.value.value,
      unit: editForm.value.unit,
    },
  };
  const result = await petStore.updateNeed(petId, needId, updatedNeed);

  if (result.isSuccess) {
    emit('needUpdated');
    appStore.addNotification('Need updated successfully', 'success');
  } else {
    appStore.addNotification(resultMessage(result, 'Failed to update need'), 'error');
  }
  closeEditModal();
};

const deleteNeed = async (needId?: string) => {
  if (!needId) return;

  const result = await petStore.deleteNeed(petId, needId);
  if (result.isSuccess) {
    handleNeedDeletion?.(true);
  } else {
    appStore.addNotification(result.message || 'Failed to delete need', 'error');
  }
};
</script>

<style scoped>
.need-card {
  border-radius: 40px;
  background: var(--color-need-bg);
  width: 100%;
  max-width: 350px;
  margin: 4px 0;
  padding: 10px;
}

.card-inactive {
  background: var(--color-need-inactive);
  color: var(--color-muted-foreground);
  border: 1px solid #d0d0d0;
  opacity: 0.8;
  transition: background 0.3s ease-in-out, color 0.3s ease-in-out;
}

.card-inactive .complete-button,
.card-inactive .done-label,
.card-inactive button {
  color: #afa8a8;
}

.need-card-category {
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 10px;
}

.need-card-description {
  margin-top: 6px;
  font-size: 0.9rem;
  opacity: 0.85;
}

.need-card-field {
  margin-top: 10px;
}

.complete-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--color-button-primary);
  border: none;
  border-radius: 15px;
  padding: 6px 12px;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--color-primary-foreground);
  cursor: pointer;
  min-width: 60px;
  transition: opacity 0.2s, transform 0.1s;
}

@media (hover: hover) {
  .complete-button:hover {
    opacity: 0.85;
  }
}

.complete-button:active {
  transform: scale(0.96);
}

.complete-button:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

.complete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.done-label {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: var(--color-status-done);
  color: var(--color-foreground);
  border-radius: 15px;
  text-align: center;
  min-width: 60px;
  padding: 6px 12px;
  font-size: 0.85rem;
  justify-content: center;
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

@media (max-width: 568px) {

  .complete-button,
  .done-label {
    font-size: 0.70rem;
    padding: 5px 10px;
  }
}
</style>
