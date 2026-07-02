<template>
  <div :class="{ 'app-page-root': $route.matched.length === 1 }">
    <div v-if="$route.matched.length === 1" id="main-content" role="main" tabindex="-1"
      :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <TheLoadingSpinner v-if="isLoading && !pet" message="Fetching your family member..." />
      <div v-else-if="pet" class="pet-container pet-panel">
        <div class="full-pet-card">

          <div class="pet-overview">
            <div class="pet-copy">
              <div class="inline-container">
                <h1 class="text-[1.4rem] max-[568px]:text-[1.2rem]">{{ pet.name }}</h1>
                <button v-if="pet.owner?.id === userStore.id" class="settings-button" aria-label="Edit pet" @click="router.push({ name: 'edit-pet' })">
                  <Settings class="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div class="pet-info">
                <p><strong>Description:</strong> {{ pet.description }}</p>
                <p><strong>Species:</strong> {{ pet.species }}</p>
                <p><strong>Breed:</strong> {{ pet.breed }}</p>
                <p><strong>Birthday:</strong> {{ pet.birthday }}</p>
                <p><strong>Owner:</strong> {{ pet.owner?.userName }}</p>
                <p v-if="pet.careTakers && pet.careTakers.length > 0">
                  <strong>Care takers:</strong>
                  <span v-for="(careTaker, index) in pet.careTakers" :key="careTaker.id">
                    {{ careTaker.userName }}{{ index !== pet.careTakers.length - 1 ? ', ' : '' }}
                  </span>
                </p>
              </div>
            </div>

            <img class="pet-detail-image" :src="petImageSrc" :alt="`${pet.name} picture`" />
          </div>

          <!-- Need related container -->
          <div class="header-button-container">
            <h3 class="text-center mt-2 mb-0">Daily Care Tasks</h3>
            <template v-if="pet.owner?.id === userStore.id && currentDate === ownerToday">
              <button class="custom-button" aria-label="Add care task" @click="setOpen(true)" v-if="needsForCurrentDate.length < 10">
                <CirclePlus class="inline-block w-4 h-4 mr-1" aria-hidden="true" />
                Add a Care Task
              </button>
              <p v-else>That's plenty of love for one day! 🐾</p>
            </template>
            <button class="custom-button" @click="currentDate = ownerToday"
              v-if="currentDate !== ownerToday">
              Today
            </button>
          </div>

          <!-- Add Care Task Modal -->
          <Dialog v-if="isOpen" :open="isOpen" @update:open="setOpen($event)" title="New care task" maxWidth="620px">
            <div class="care-task-dialog">
              <form class="care-task-form" @submit.prevent="addNewNeed">
                <h3 class="form-header">What does {{ pet.name }} need today?</h3>

                <label class="form-label" for="need-category">Type of care</label>
                <div class="form-field">
                  <input id="need-category" class="form-field-input" v-model="category" required placeholder="e.g. Walk, Feed, Medicine" />
                </div>

                <label class="form-label" for="need-description">More details</label>
                <div class="form-field">
                  <input id="need-description" class="form-field-input" v-model="description" required placeholder="e.g. Morning walk in the park" />
                </div>

                <label class="form-label" for="need-date">Date</label>
                <div class="form-field">
                  <input id="need-date" class="form-field-input" readonly :value="currentDate" required />
                </div>

                <label class="form-label" id="need-measurement-label">Measurement type</label>
                <div v-show="!selection" class="mt-2">
                  <RadioGroup v-model="selection" aria-labelledby="need-measurement-label"
                    :aria-invalid="formFieldsErrorDetailsObject.selection ? true : undefined"
                    :aria-describedby="formFieldsErrorDetailsObject.selection ? 'need-selection-error' : undefined">
                    <div class="care-task-measurement-options">
                      <RadioGroupItem value="duration" label="Duration" />
                      <RadioGroupItem value="quantity" label="Quantity" />
                    </div>
                  </RadioGroup>
                </div>

                <div v-if="selection === 'quantity'">
                  <label class="form-label" for="need-quantity-value">Value and Unit</label>
                  <div class="value-unit-row">
                    <input id="need-quantity-value" class="form-field-input value-unit-value" v-model="valueOfSelection" required autofocus
                      @input="cleanInput($event)" inputmode="numeric" placeholder="Enter value"
                      :aria-invalid="formFieldsErrorDetailsObject.quantityUnit ? true : undefined"
                      :aria-describedby="formFieldsErrorDetailsObject.quantityUnit ? 'need-quantity-error' : undefined" />
                    <div class="value-unit-select">
                      <Select v-model="unitOfSelection" :options="quantityUnits" placeholder="Unit" aria-label="Select unit" />
                    </div>
                  </div>
                </div>

                <div v-if="selection === 'duration'">
                  <label class="form-label" for="need-duration-value">Duration (minutes)</label>
                  <div class="form-field">
                    <input id="need-duration-value" class="form-field-input" v-model="valueOfSelection" required autofocus @input="cleanInput($event)"
                      inputmode="numeric" placeholder="Enter duration in minutes"
                      :aria-invalid="formFieldsErrorDetailsObject.durationValue ? true : undefined"
                      :aria-describedby="formFieldsErrorDetailsObject.durationValue ? 'need-duration-error' : undefined" />
                  </div>
                </div>

                <div class="form-button-group">
                  <button class="form-button primary" type="submit" aria-label="Add care task">Add to Routine</button>
                  <button class="form-button secondary" type="button"
                    @click="() => { selection = ''; valueOfSelection = null; unitOfSelection = ''; }" v-if="selection">
                    Return
                  </button>
                </div>

                <div v-if="formFieldsErrorDetailsObject.selection" id="need-selection-error" class="custom-error-message" role="alert">
                  {{ formFieldsErrorDetailsObject.selection }}
                </div>
                <div v-if="formFieldsErrorDetailsObject.durationValue" id="need-duration-error" class="custom-error-message" role="alert">
                  {{ formFieldsErrorDetailsObject.durationValue }}
                </div>
                <div v-if="formFieldsErrorDetailsObject.quantityUnit" id="need-quantity-error" class="custom-error-message" role="alert">
                  {{ formFieldsErrorDetailsObject.quantityUnit }}
                </div>
              </form>
            </div>
          </Dialog>

          <section v-if="pet" class="daily-care-section" :aria-busy="isLoading ? 'true' : undefined">
            <div class="date-navigation">
              <button class="custom-button" @click="changeDay(-1)">← Previous</button>
              <h4>{{ currentDate }}</h4>
              <button class="custom-button" @click="changeDay(1)">Next →</button>
            </div>

            <div class="care-task-area" role="region" aria-label="Care tasks for selected day" :tabindex="needsForCurrentDate.length ? 0 : undefined">
              <ul v-if="needsForCurrentDate.length" class="care-task-list">
                <li v-for="need in needsForCurrentDate" :key="need.id" class="care-task-list-item">
                  <div class="need-cards-container">
                    <the-need-card :need="need" :petId="currentPetId" :todayDate="ownerToday" @needDeleted="handleNeedDeleted" @needUpdated="refreshCurrentPet" />
                  </div>
                </li>
              </ul>
              <div v-else class="empty-care-state">
                <p class="empty-care-title">{{ emptyCareState.title }}</p>
                <p class="empty-care-description">{{ emptyCareState.description }}</p>
              </div>
            </div>
          </section>

        </div>
      </div>

      <div v-else class="pet-container">
        <p>We couldn't find that furry friend. 🐾</p>
      </div>

    </div>
    <div v-else>
      <router-view />
    </div>

    <TheFooter v-if="$route.matched.length === 1" />
  </div>
</template>

<script setup lang="ts">
import { CirclePlus, Settings } from '@lucide/vue';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { computed, onBeforeMount, provide, type Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TheFooter from '@/components/TheFooter.vue';
import TheLoadingSpinner from '@/components/TheLoadingSpinner.vue';
import TheNeedCard from '@/components/TheNeedCard.vue';
import { Dialog, RadioGroup, RadioGroupItem, Select } from '@/components/ui';
import { resultMessage } from '@/lib/apiError';
import { getPetImageSrc } from '@/lib/petImages';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import type { Need, Pet } from '@/types/pet';

dayjs.extend(utc);
dayjs.extend(timezone);

const router = useRouter();
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const route = useRoute();
const petStore = usePetStore();
const userStore = useUserStore();

const currentDate: Ref<string> = ref(dayjs().tz(userStore.timezone).format('YYYY-MM-DD'));
const pet: Ref<Pet | null> = ref(null);
const petImageSrc = computed(() => getPetImageSrc(pet.value?.image));
const hasSetInitialDate = ref(false);
const isLoading = ref(true);
const isOpen = ref(false);
const category: Ref<Need['category']> = ref('');
const description: Ref<Need['description']> = ref('');

const formFieldsErrorDetailsObject = ref({
  selection: '',
  durationValue: '',
  quantityUnit: '',
});

const selection = ref('');
const valueOfSelection: Ref<
  NonNullable<Need['duration']>['value'] | NonNullable<Need['quantity']>['value'] | null
> = ref(null);
const unitOfSelection: Ref<
  NonNullable<Need['duration']>['unit'] | NonNullable<Need['quantity']>['unit'] | ''
> = ref('');
const isOwner = ref(false);

const ownerTimezone = computed(() => pet.value?.owner?.timezone || userStore.timezone || 'UTC');

const ownerToday = computed(() => dayjs().tz(ownerTimezone.value).format('YYYY-MM-DD'));

const quantityUnits = [
  { label: 'ml', value: 'ml' },
  { label: 'g', value: 'g' },
];

const changeDay = (delta: number) => {
  const newDate = dayjs.tz(currentDate.value, ownerTimezone.value).add(delta, 'days');
  currentDate.value = newDate.format('YYYY-MM-DD');
};

// The needs list only renders for a loaded pet, which always has an id.
const currentPetId = computed(() => pet.value?.id ?? '');

const needsByDateComputed = computed<Record<string, Need[]>>(() => {
  if (!pet.value?.needs) return {};
  return pet.value.needs.reduce((acc: Record<string, Need[]>, need) => {
    if (!acc[need.dateFor]) {
      acc[need.dateFor] = [];
    }
    acc[need.dateFor].push(need);
    return acc;
  }, {});
});

const needsForCurrentDate = computed(() => needsByDateComputed.value[currentDate.value] ?? []);

const emptyCareState = computed(() => {
  if (currentDate.value > ownerToday.value) {
    return {
      title: 'Care tasks will appear when this day starts',
      description:
        'Nothing needs doing yet. Future routines are generated on the day they are due.',
    };
  }

  if (currentDate.value < ownerToday.value) {
    return {
      title: 'No care tasks for this day',
      description: 'There were no care tasks scheduled here.',
    };
  }

  return {
    title: 'All clear for today! 🎉',
    description: 'No care tasks are waiting right now.',
  };
});

const setOpen = (open: boolean) => {
  isOpen.value = open;
  clearFields();
};

const clearFields = () => {
  category.value = '';
  description.value = '';
  selection.value = '';
  valueOfSelection.value = null;
  unitOfSelection.value = '';
};

const cleanInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  target.value = target.value.replace(/[^0-9]/g, '');
  let value = target.value;
  value = value.replace(/^0+/, '');
  valueOfSelection.value = Number(value);
};

const applyPet = (fetchedPet: Pet, id: string) => {
  pet.value = fetchedPet;
  if (!hasSetInitialDate.value) {
    currentDate.value = ownerToday.value;
    hasSetInitialDate.value = true;
  }
  isOwner.value = petStore.isOwner(id);
};

async function getPet(id: string) {
  const cachedPet = petStore.getPetById(id);
  const isSamePet = pet.value?.id === id;

  if (cachedPet) {
    applyPet(cachedPet, id);
    isLoading.value = false;
  } else {
    if (!isSamePet) {
      pet.value = null;
    }
    isLoading.value = true;
  }

  const result = await petStore.getAllPets();
  const fetchedPet = petStore.getPetById(id);

  if (fetchedPet) {
    applyPet(fetchedPet, id);
  } else if (!cachedPet || result.isSuccess) {
    pet.value = null;
    isOwner.value = false;
    hasSetInitialDate.value = false;
  }

  isLoading.value = false;
}

const refreshCurrentPet = async () => {
  if (currentPetId.value) {
    await getPet(currentPetId.value);
  }
};

async function loadRoutePet() {
  const id = route.params.id as string;
  if (id) {
    await getPet(id);
  } else {
    pet.value = null;
    isLoading.value = false;
  }
}

const addNewNeed = async () => {
  const petId = pet.value?.id;
  if (!petId) {
    return;
  }

  if (!category.value || !description.value) {
    appStore.addNotification('Oops! We need all the details for this care task.', 'error');
    return;
  }

  const validateSelection = () => {
    if (!selection.value) {
      formFieldsErrorDetailsObject.value.selection = 'Please choose a need type';
      return false;
    }
    return true;
  };

  const validateDuration = () => {
    if (selection.value === 'duration' && (valueOfSelection.value ?? 0) > 1440) {
      formFieldsErrorDetailsObject.value.durationValue = 'Duration cannot be over 1440 minutes';
      return false;
    }
    return true;
  };

  const validateQuantityUnit = () => {
    if (selection.value === 'quantity' && unitOfSelection.value === '') {
      formFieldsErrorDetailsObject.value.quantityUnit = 'Please select a unit';
      return false;
    }
    return true;
  };

  if (!validateSelection() || !validateDuration() || !validateQuantityUnit()) {
    setTimeout(() => {
      formFieldsErrorDetailsObject.value.selection = '';
      formFieldsErrorDetailsObject.value.durationValue = '';
      formFieldsErrorDetailsObject.value.quantityUnit = '';
    }, 5000);
    return;
  }

  // Duration has no unit picker in the form, so the unit is always 'minutes'.
  const unit = selection.value === 'duration' ? 'minutes' : unitOfSelection.value;

  const needObject: Need = {
    category: category.value,
    description: description.value,
    dateFor: currentDate.value,
    [selection.value]: {
      value: valueOfSelection.value,
      unit,
    },
  };

  const result = await petStore.addNewNeed(petId, needObject);
  if (result.isSuccess) {
    setOpen(false);
    await getPet(petId);
  } else {
    appStore.addNotification(
      resultMessage(result, "Couldn't save the need. Please try again."),
      'error',
    );
  }
};

watch(() => route.params.id, loadRoutePet);

watch(selection, (newValue) => {
  if (newValue === 'duration') {
    unitOfSelection.value = 'minutes';
  }
});

onBeforeMount(loadRoutePet);

const handleNeedDeleted = async (deleted: boolean) => {
  if (deleted && pet.value?.id) {
    await getPet(pet.value.id);
    appStore.addNotification('Care task removed 🐾', 'success');
  }
};

provide('isOwner', isOwner);
provide('handleNeedDeletion', handleNeedDeleted);
</script>

<style scoped>
.pet-container,
.header-button-container,
.date-navigation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-stack);
  width: 100%;
  max-width: 100%;
}

.header-button-container {
  margin-bottom: var(--space-stack);
  text-align: center;
}

.date-navigation {
  margin-top: 4px;
  margin-bottom: 0;
}

.pet-container {
  gap: clamp(0.75rem, 3vw, 1.25rem);
}

.full-pet-card {
  background-color: var(--color-surface-app);
  border-radius: var(--radius-2xl);
  border: 2px solid var(--color-button-secondary);
  box-shadow: var(--shadow-soft-card);
  padding: var(--space-card);
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  box-sizing: border-box;
  overflow-wrap: anywhere;
}

.pet-overview {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: clamp(1rem, 4vw, 2rem);
  width: 100%;
}

.pet-copy {
  flex: 1 1 auto;
  min-width: 0;
}

.pet-detail-image {
  width: clamp(120px, 26vw, 170px);
  aspect-ratio: 1;
  object-fit: contain;
  flex: 0 0 auto;
  border-radius: var(--radius-xl);
  background: var(--color-surface-inner);
  border: 2px solid var(--color-button-secondary);
  box-shadow: var(--shadow-button);
}

.pet-info {
  margin: 8px 0 12px;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--color-button-secondary);
  border-radius: var(--radius-lg);
  background: var(--color-surface-app-soft);
  box-shadow: var(--shadow-field);
}

.pet-info p {
  margin: 4px 0;
  line-height: 1.45;
}

.care-task-dialog {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: clamp(0.85rem, 3vw, 1.15rem);
  border: 2px solid var(--color-button-secondary);
  border-radius: var(--radius-2xl);
  background: var(--color-surface-app);
  box-shadow: var(--shadow-panel);
  box-sizing: border-box;
}

.care-task-form {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.care-task-form .form-header {
  margin-bottom: 10px;
  font-size: clamp(1rem, 3vw, 1.2rem);
}

.care-task-form .form-field-input::placeholder {
  opacity: 0.62;
}

.care-task-form .form-field-input[readonly] {
  cursor: default;
}

.care-task-measurement-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  margin: 6px 0 10px;
  padding: 10px 12px;
  border: 1px solid var(--color-form-field-border);
  border-radius: var(--radius-field);
  background: var(--color-form-field-bg);
  box-shadow: var(--shadow-field);
}

.care-task-measurement-options :deep(.radio-group-label) {
  flex: 1 1 9rem;
  justify-content: center;
  min-width: min(100%, 8.5rem);
}

.care-task-measurement-options :deep(.radio-group-text) {
  font-size: 0.9rem;
  font-weight: 600;
}

.daily-care-section {
  display: flex;
  flex-direction: column;
  gap: clamp(0.85rem, 2.2vw, 1.25rem);
  width: 100%;
}

.care-task-area {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: clamp(150px, 22vw, 190px);
  max-height: clamp(22rem, 44vh, 30rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable both-edges;
  padding: 0 0.35rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  background: var(--color-surface-app-soft);
  box-sizing: border-box;
  box-shadow: var(--shadow-inset-surface);
}

.care-task-area:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 3px;
}

.care-task-list {
  width: 100%;
  margin: 0;
  padding: 0;
}

.care-task-list-item {
  margin-bottom: 0;
}

.need-cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(0.75rem, 3vw, 1rem);
  width: 100%;
  margin: var(--space-stack) 0;
}

.empty-care-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
  max-width: min(100%, clamp(350px, 45vw, 420px));
  min-height: clamp(120px, 18vw, 150px);
  margin: var(--space-stack) auto;
  padding: 1rem;
  border: 0;
  border-radius: var(--radius-2xl);
  background: transparent;
  box-sizing: border-box;
  text-align: center;
}

.empty-care-state p {
  margin: 0;
}

.empty-care-title {
  color: var(--color-primary-foreground);
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.35;
}

.empty-care-description {
  max-width: 28rem;
  color: var(--color-foreground);
  font-size: 0.82rem;
  line-height: 1.45;
  opacity: 0.82;
}

@media (min-width: 568px) {
  .date-navigation {
    display: grid;
    grid-template-columns: minmax(120px, 140px) minmax(0, 1fr) minmax(120px, 140px);
    align-items: center;
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    gap: 10px;
  }

  .date-navigation .custom-button {
    min-width: 0;
    width: 100%;
    padding: 8px 18px;
  }

  .date-navigation h4 {
    margin: 0;
    text-align: center;
    font-weight: bold;
    grid-column: 2;
    overflow-wrap: anywhere;
  }
}

@media (max-width: 568px) {
  .full-pet-card {
    border-radius: var(--radius-xl);
  }

  .care-task-area {
    min-height: 140px;
    max-height: min(54svh, 30rem);
    padding: 0 0.2rem;
    border-radius: var(--radius-xl);
  }

  .empty-care-state {
    min-height: 112px;
    border-radius: var(--radius-xl);
  }

  .pet-overview {
    flex-direction: column-reverse;
    align-items: center;
  }

  .pet-detail-image {
    width: min(150px, 60vw);
  }

  .care-task-dialog {
    padding: 0.85rem;
    border-radius: var(--radius-xl);
  }

  .care-task-measurement-options {
    gap: 10px;
    padding: 10px;
  }

  .date-navigation .custom-button {
    width: min(100%, 220px);
  }

  .date-navigation h4 {
    margin: 0;
  }
}
</style>
