<template>
  <div class="need-card" :class="{ 'is-expanded': showOptions, 'card-inactive': !needProp.isActive }">
    <div class="text-center">
      <h5 class="need-card-category">{{ needProp.category }}</h5>
      <p class="need-card-description">{{ needProp.description }}</p>
      <p class="need-card-field">{{ needProp.duration?.value || needProp.quantity?.value }} {{ needProp.duration?.unit || needProp.quantity?.unit }}</p>
    </div>

    <div class="flex justify-center items-center gap-2">
      <button class="complete-button" v-if="!needProp.completed && isToday" :disabled="isSaving" aria-label="Mark as done" @click="addRecord(petIdProp, needProp)">
        <Check class="size-4" aria-hidden="true" />All Done!
      </button>
      <div class="done-label" v-if="needProp.completed">
        <CheckCheck class="size-4" aria-hidden="true" />
        Purrfectly done!
      </div>

      <button v-if="isOwner" aria-label="Need options"
        class="bg-transparent border-none cursor-pointer text-primary-foreground p-1 rounded-full transition-colors hover:bg-black/10 active:bg-black/15"
        @click="toggleOptions">
        <EllipsisVertical class="size-5" aria-hidden="true" />
      </button>
    </div>

    <!-- Toggleable buttons -->
    <div v-if="isOwner" class="options-container">
      <div class="options-content">
        <!-- Edit need button -->
        <button v-if="isToday || isFuture" @click="editNeed" aria-label="Edit need"
          class="bg-transparent border-none cursor-pointer text-primary-foreground p-1.5 rounded-full transition-colors hover:bg-black/10 active:bg-black/15">
          <Pencil class="size-5" aria-hidden="true" />
        </button>

        <!-- isActive toggle -->
        <div v-if="isToday || isFuture" class="flex flex-col items-center">
          <span class="text-sm text-primary-foreground block mb-1">
            {{ needProp.isActive ? 'Active' : 'Inactive' }}
          </span>
          <Switch :checked="needProp.isActive" @update:checked="toggleNeedActive(needProp.id)"
            :aria-label="`Toggle need active (currently ${needProp.isActive ? 'active' : 'inactive'})`" />
        </div>

        <!-- Delete need button -->
        <button @click="showDeleteConfirm = true" aria-label="Delete need"
          class="bg-transparent border-none cursor-pointer text-primary-foreground p-1.5 rounded-full transition-colors hover:bg-red-500/15 active:bg-red-500/25">
          <Trash2 class="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Delete confirmation dialog - only rendered when needed -->
    <AlertDialog v-if="showDeleteConfirm" :open="showDeleteConfirm" title="Remove this care task?" message="This care task will be removed for the day. Remove it?"
      confirmLabel="Remove" cancelLabel="Keep it" variant="danger" @confirm="deleteNeed(needProp.id); showDeleteConfirm = false"
      @cancel="showDeleteConfirm = false" />

    <!-- Edit need modal - only rendered when needed -->
    <Dialog v-if="isEditModalOpen" :open="isEditModalOpen" @update:open="(v) => { if (!v) closeEditModal(); }" title="Edit care task" maxWidth="520px">
      <form @submit.prevent="updateNeed">
        <label class="form-label" :for="`need-${needProp.id}-category`">Type of care</label>
        <input :id="`need-${needProp.id}-category`" v-model="editForm.category" required type="text" placeholder="e.g. Walk, Feed, Medicine"
          class="form-field-input mb-1" />

        <label class="form-label" :for="`need-${needProp.id}-description`">More details</label>
        <input :id="`need-${needProp.id}-description`" v-model="editForm.description" required type="text" placeholder="e.g. Morning walk in the park"
          class="form-field-input mb-1" />

        <div v-if="editForm.type === 'quantity'">
          <label class="form-label" :for="`need-${needProp.id}-quantity-value`">Quantity</label>
          <input :id="`need-${needProp.id}-quantity-value`" v-model="editForm.value" type="number" placeholder="Enter quantity" required
            class="form-field-input mb-1" />

          <label class="form-label">Select unit</label>
          <Select :modelValue="editForm.unit" @update:modelValue="(v) => editForm.unit = v" placeholder="Select unit" aria-label="Select unit"
            :options="[{ value: 'ml', label: 'ml' }, { value: 'g', label: 'g' }]" />
        </div>

        <div v-else>
          <label class="form-label" :for="`need-${needProp.id}-duration-value`">Duration</label>
          <div class="flex items-center gap-2">
            <input :id="`need-${needProp.id}-duration-value`" v-model="editForm.value" type="number" placeholder="Enter duration" required
              class="form-field-input mb-1" />
            <span class="text-sm text-foreground">minute(s)</span>
          </div>
        </div>

        <div class="flex justify-center mt-4">
          <button type="submit" aria-label="Update care task" class="custom-button">Save Changes</button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Check, CheckCheck, EllipsisVertical, Pencil, Trash2 } from '@lucide/vue';
import type { Ref } from 'vue';
import { computed, inject, onBeforeMount, ref, toRefs } from 'vue';
import { AlertDialog, Dialog, Select, Switch } from '@/components/ui';
import { resultMessage } from '@/lib/apiError';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import type { DurationRecord, Need, QuantityRecord } from '@/types/pet';

const petStore = usePetStore();
const appStore = useAppStore();

const props = defineProps<{
  need: Need;
  petId: string;
  todayDate: string;
}>();
const { need: needProp, petId: petIdProp, todayDate: todayDateProp } = toRefs(props);

const emit = defineEmits(['needDeleted', 'needUpdated']);

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
  const need = needProp.value;
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
const isOwner = inject<Ref<boolean>>('isOwner');

const isFuture = computed(() => {
  return needProp.value.dateFor > todayDateProp.value;
});

const isToday = computed(() => {
  return needProp.value.dateFor === todayDateProp.value;
});

const isSaving = ref(false);

const addRecord = async (petId: string, need: Need) => {
  if (isSaving.value) return;
  const needId = need.id;
  if (!needId) return;
  isSaving.value = true;

  let recordObject = {
    note: '',
  } as QuantityRecord | DurationRecord;

  if (need.duration) {
    recordObject = {
      ...recordObject,
      duration: {
        value: need.duration.value,
        unit: need.duration.unit,
      },
    };
  } else if (need.quantity) {
    recordObject = {
      ...recordObject,
      quantity: {
        value: need.quantity.value,
        unit: need.quantity.unit,
      },
    };
  }

  const result = await petStore.addRecord(petId, needId, recordObject);
  if (result.isSuccess) {
    appStore.addNotification('Purrfectly done! 🐾', 'success');
  } else {
    appStore.addNotification(
      resultMessage(result, "We couldn't save that. Please try again."),
      'error',
    );
  }
  isSaving.value = false;
};

const toggleOptions = () => {
  if (!isOwner?.value) return;
  showOptions.value = !showOptions.value;
};

const editNeed = () => {
  const need = needProp.value;
  isEditModalOpen.value = true;
  editForm.value = { ...editForm.value, category: need.category, description: need.description };
};

const toggleNeedActive = async (needId: string | undefined) => {
  if (!needId || !isOwner?.value) return;

  const result = await petStore.toggleNeedisActive(petIdProp.value, needId);
  if (result.isSuccess) {
    emit('needUpdated');
    appStore.addNotification(
      needProp.value.isActive ? 'Care task paused 🐾' : 'Care task is active again! 🐾',
      'success',
    );
  } else {
    appStore.addNotification(
      resultMessage(result, "We couldn't update that care task. Please try again."),
      'error',
    );
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
    appStore.addNotification('Oops! We need all the details for this care task.', 'error');
    return;
  }

  const needId = needProp.value.id;
  if (!needId) return;

  const updatedNeed = {
    category: editForm.value.category,
    description: editForm.value.description,
    [editForm.value.type]: {
      value: editForm.value.value,
      unit: editForm.value.unit,
    },
  };
  const result = await petStore.updateNeed(petIdProp.value, needId, updatedNeed);

  if (result.isSuccess) {
    emit('needUpdated');
    appStore.addNotification('Care task updated! 🐾', 'success');
  } else {
    appStore.addNotification(
      resultMessage(result, "We couldn't update that care task. Please try again."),
      'error',
    );
  }
  closeEditModal();
};

const deleteNeed = async (needId: string | undefined) => {
  if (!needId) return;

  const result = await petStore.deleteNeed(petIdProp.value, needId);
  if (result.isSuccess) {
    handleNeedDeletion?.(true);
  } else {
    appStore.addNotification(
      resultMessage(result, "We couldn't remove that care task. Please try again."),
      'error',
    );
  }
};
</script>

<style scoped>
.need-card {
  border-radius: var(--radius-2xl);
  background: var(--color-need-bg);
  width: 100%;
  /* Grows from the comfortable phone size up to a wider card on tablets/desktop;
     width:100% still shrinks it below the floor on narrow screens. */
  max-width: min(100%, clamp(350px, 45vw, 420px));
  margin: 0;
  padding: clamp(0.75rem, 2vw, 1rem);
  box-sizing: border-box;
  box-shadow: var(--shadow-sm);
  overflow-wrap: anywhere;
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
  /* Darkened from #afa8a8 to meet WCAG 4.5:1 on the inactive card background */
  color: #5d5d5d;
}

.need-card-category {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 4px 0 0;
  line-height: 1.25;
}

.need-card-description {
  margin: 6px 0 0;
  font-size: 0.9rem;
  line-height: 1.35;
  opacity: 0.85;
}

.need-card-field {
  margin: 10px 0;
  line-height: 1.35;
}

.complete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--color-button-primary);
  border: none;
  border-radius: var(--radius-md);
  padding: 6px 12px;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  line-height: 1.2;
  color: var(--color-primary-foreground);
  cursor: pointer;
  min-width: 60px;
  min-height: 44px;
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
  border-radius: var(--radius-md);
  text-align: center;
  min-width: 60px;
  min-height: 44px;
  padding: 6px 12px;
  font-size: 0.85rem;
  line-height: 1.2;
  justify-content: center;
}

/* Expand/collapse via grid row tracks: content-driven, no magic height
   so longer option labels are never clipped on small screens. */
.options-container {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 0.3s ease, opacity 0.3s ease;
}

.options-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(0.75rem, 4vw, 1.25rem);
  min-height: 0;
  overflow: hidden;
}

.is-expanded .options-container {
  grid-template-rows: 1fr;
  opacity: 1;
}

@media (max-width: 568px) {
  .need-card {
    border-radius: var(--radius-xl);
  }

  .complete-button,
  .done-label {
    font-size: 0.70rem;
    padding: 5px 10px;
  }
}
</style>
