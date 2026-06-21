<template>
  <div>
    <div v-if="$route.matched.length === 1" id="main-content" role="main" tabindex="-1"
      :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <TheLoadingSpinner v-if="isLoading" message="Loading pet..." />
      <div v-else-if="pet" class="pet-container">
        <div class="full-pet-card">

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

          <!-- Need related container -->
          <div class="header-button-container">
            <h3 class="text-center mt-2 mb-0">Needs:</h3>
            <template v-if="pet.owner?.id === userStore.id && currentDate === dayjs().tz(userStore.timezone).format('YYYY-MM-DD')">
              <button class="custom-button" @click="setOpen(true)" v-if="needsByDate[currentDate] ? needsByDate[currentDate]?.length < 10 : true">
                <CirclePlus class="inline-block w-4 h-4 mr-1" aria-hidden="true" />
                Add need
              </button>
              <p v-else>Maximum 10 needs per day</p>
            </template>
            <button class="custom-button" @click="currentDate = dayjs().tz(userStore.timezone).format('YYYY-MM-DD')"
              v-if="currentDate !== dayjs().tz(userStore.timezone).format('YYYY-MM-DD')">
              Today
            </button>
          </div>

          <!-- Add Need Modal -->
          <Dialog v-if="isOpen" :open="isOpen" @update:open="setOpen($event)" title="New need">
            <div>
              <form @submit.prevent="addNewNeed">
                <h3 class="form-header">Add New Need</h3>

                <label class="form-label" for="need-category">Category:</label>
                <div class="form-field">
                  <input id="need-category" class="form-field-input" v-model="category" required placeholder="e.g. Walk, Feed, Medicine" />
                </div>

                <label class="form-label" for="need-description">Description:</label>
                <div class="form-field">
                  <input id="need-description" class="form-field-input" v-model="description" required placeholder="e.g. Morning walk in the park" />
                </div>

                <label class="form-label" for="need-date">Date:</label>
                <div class="form-field">
                  <input id="need-date" class="form-field-input" readonly :value="currentDate" required />
                </div>

                <label class="form-label" id="need-measurement-label">Measurement type</label>
                <div v-show="!selection" class="mt-2">
                  <RadioGroup v-model="selection" aria-labelledby="need-measurement-label">
                    <div class="flex gap-4">
                      <RadioGroupItem value="duration" label="Duration" />
                      <RadioGroupItem value="quantity" label="Quantity" />
                    </div>
                  </RadioGroup>
                </div>

                <div v-if="selection === 'quantity'">
                  <label class="form-label" for="need-quantity-value">Value and Unit:</label>
                  <div class="flex gap-2 items-center">
                    <div class="form-field flex-1">
                      <input id="need-quantity-value" class="form-field-input w-full min-w-[80px]" v-model="valueOfSelection" required autofocus
                        @input="cleanInput($event)" inputmode="numeric" placeholder="Enter value" />
                    </div>
                    <Select v-model="unitOfSelection" :options="quantityUnits" placeholder="select unit" class="w-28" aria-label="Select unit" />
                  </div>
                </div>

                <div v-if="selection === 'duration'">
                  <label class="form-label" for="need-duration-value">Duration (minutes):</label>
                  <div class="form-field">
                    <input id="need-duration-value" class="form-field-input" v-model="valueOfSelection" required autofocus @input="cleanInput($event)"
                      inputmode="numeric" placeholder="Enter duration in minutes" />
                  </div>
                </div>

                <div class="form-button-group">
                  <button class="form-button primary" type="submit">Add Need</button>
                  <button class="form-button secondary" type="button"
                    @click="() => { selection = ''; valueOfSelection = null; unitOfSelection = ''; }" v-if="selection">
                    Return
                  </button>
                </div>

                <div v-if="formFieldsErrorDetailsObject.selection" class="custom-error-message" role="alert">
                  {{ formFieldsErrorDetailsObject.selection }}
                </div>
                <div v-if="formFieldsErrorDetailsObject.durationValue" class="custom-error-message" role="alert">
                  {{ formFieldsErrorDetailsObject.durationValue }}
                </div>
                <div v-if="formFieldsErrorDetailsObject.quantityUnit" class="custom-error-message" role="alert">
                  {{ formFieldsErrorDetailsObject.quantityUnit }}
                </div>
              </form>
            </div>
          </Dialog>

          <div v-if="pet && needsByDate">
            <div class="date-navigation">
              <button class="custom-button" @click="changeDay(-1)">← Previous</button>
              <h4>{{ currentDate }}</h4>
              <button class="custom-button" @click="changeDay(1)">Next →</button>
            </div>

            <ul v-if="needsByDate[currentDate]">
              <li v-for="need in needsByDate[currentDate]" :key="need.id">
                <div class="need-cards-container">
                  <the-need-card :need="need" :petId="currentPetId" @needDeleted="handleNeedDeleted" @needUpdated="getPet(currentPetId)" />
                </div>
              </li>
            </ul>
            <p v-else class="text-center">All clear for today! 🎉</p>
          </div>

        </div>
      </div>

      <div v-else class="pet-container">
        <p>Pet not found</p>
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

const quantityUnits = [
  { label: 'ml', value: 'ml' },
  { label: 'g', value: 'g' },
];

const changeDay = (delta: number) => {
  const newDate = dayjs.tz(currentDate.value, userStore.timezone).add(delta, 'days');
  currentDate.value = newDate.format('YYYY-MM-DD');
};

const needsByDate = ref<Record<string, Need[]>>({});

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

async function getPet(id: string) {
  const fetchedPet = await petStore.getPetById(id);
  if (fetchedPet) {
    pet.value = fetchedPet;
    needsByDate.value = needsByDateComputed.value;
  }
  isOwner.value = await petStore.isOwner(id);
  isLoading.value = false;
}

const addNewNeed = async () => {
  const petId = pet.value?.id;
  if (!petId) {
    return;
  }

  if (!category.value || !description.value) {
    appStore.addNotification('Please fill in all fields', 'error');
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

watch(route, async () => {
  const id = route.params.id as string;
  if (id) {
    await getPet(id);
  }
});

watch(selection, (newValue) => {
  if (newValue === 'duration') {
    unitOfSelection.value = 'minutes';
  }
});

onBeforeMount(async () => {
  const id = route.params.id as string;
  if (id) {
    await getPet(id);
  }
});

const handleNeedDeleted = async (deleted: boolean) => {
  if (deleted && pet.value?.id) {
    await getPet(pet.value.id);
    appStore.addNotification('Need removed', 'success');
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
  gap: 8px;
  width: 100%;
  max-width: 100%;
}

.header-button-container {
  margin-bottom: 8px;
}

.date-navigation {
  margin-top: 4px;
  margin-bottom: 8px;
}

.pet-container {
  margin-top: 20px;
  gap: 12px;
}

.full-pet-card {
  background-color: var(--color-card);
  border-radius: 40px;
  border: 2px solid var(--color-card-border);
  box-shadow: 4px 4px 10px var(--color-shadow);
  padding: 20px;
  width: 95%;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
}

.pet-info {
  margin: 8px 0 12px;
}

.pet-info p {
  margin: 4px 0;
}

.need-cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
}

.form-label {
  font-size: 0.85rem;
  margin-bottom: 3px;
  margin-top: 6px;
  display: block;
}

@media (min-width: 568px) {
  .date-navigation {
    display: grid;
    grid-template-columns: 140px 1fr 140px;
    align-items: center;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    gap: 10px;
  }

  .date-navigation .custom-button {
    min-width: 140px;
    padding: 8px 30px;
  }

  .date-navigation h4 {
    margin: 0;
    text-align: center;
    font-weight: bold;
    grid-column: 2;
  }
}
</style>
