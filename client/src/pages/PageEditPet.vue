<template>
  <div class="app-page-root">
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container pet-form-container pet-panel">
        <form @submit.prevent="confirmUpdatePet">
          <h1 class="form-header text-[1.3rem] max-[568px]:text-[1.1rem]">Update your fur baby's info 🐾</h1>

          <ThePetImagePicker v-model="existingPetObject.image" :petName="existingPetObject.name" />

          <div>
            <label class="form-label" for="editpet-name">Name</label>
            <div class="form-field">
              <input id="editpet-name" class="form-field-input" v-model="existingPetObject.name" required placeholder="Fluffy, Whiskers, Buddy..." />
            </div>
          </div>

          <div>
            <label class="form-label" for="editpet-breed">Breed</label>
            <div class="form-field">
              <input id="editpet-breed" class="form-field-input" v-model="existingPetObject.breed" placeholder="Golden Retriever, Siamese..." />
            </div>
          </div>

          <div>
            <label class="form-label" for="editpet-species">What kind of pet?</label>
            <div class="form-field">
              <input id="editpet-species" class="form-field-input" v-model="existingPetObject.species" placeholder="Dog, cat, rabbit..." />
            </div>
          </div>

          <div>
            <label class="form-label" for="editpet-description">Tell us about them</label>
            <div class="form-field">
              <textarea id="editpet-description" class="form-field-input" v-model="existingPetObject.description"
                placeholder="Personality, quirks, favourite treats..."></textarea>
            </div>
          </div>

          <div>
            <label class="form-label" for="editpet-birthday">When were they born?</label>
            <div class="form-field">
              <input id="editpet-birthday" class="form-field-input" type="date" :value="birthdayInputValue" @change="dateSelected($event)"
                :max="todayString" :aria-invalid="dateErrorMessage ? true : undefined"
                :aria-describedby="dateErrorMessage ? 'editpet-birthday-error' : undefined" />
            </div>
            <p id="editpet-birthday-error" class="custom-error-message" v-if="dateErrorMessage" role="alert">{{ dateErrorMessage }}</p>
          </div>

          <div class="form-button-group">
            <button type="submit" aria-label="Update pet" class="form-button primary">Save Changes</button>
            <button type="button" @click="cancelEdit" class="form-button secondary">Cancel</button>
            <button type="button" class="form-button danger" aria-label="Delete pet" @click="showDeleteDialog = true">
              <Trash2 class="inline-block w-4 h-4 mr-1" aria-hidden="true" />
              Delete Pet
            </button>
          </div>
        </form>
      </div>

      <TheConfirmDialog :isOpen="showUpdateDialog" title="Save changes?" message="Save the new details for your fur baby?" confirmLabel="Save"
        @confirm="updatePet(); showUpdateDialog = false" @cancel="showUpdateDialog = false" />

      <TheConfirmDialog :isOpen="showDeleteDialog" title="Say goodbye?" message="Remove this pet and all their care history? We'll miss them! 🐾" confirmLabel="Delete"
        variant="danger" :icon="Trash2" @confirm="deletePet(); showDeleteDialog = false" @cancel="showDeleteDialog = false" />
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { Trash2 } from '@lucide/vue';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { computed, onBeforeMount, type Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
import TheFooter from '@/components/TheFooter.vue';
import ThePetImagePicker from '@/components/ThePetImagePicker.vue';
import { DEFAULT_PET_IMAGE, normalizePetImage } from '@/lib/petImages';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import type { Pet } from '@/types/pet';

dayjs.extend(utc);
dayjs.extend(timezone);

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const route = useRoute();
const petStore = usePetStore();
const userStore = useUserStore();

const showUpdateDialog = ref(false);
const showDeleteDialog = ref(false);
const dateErrorMessage = ref('');
const existingPetObject: Ref<Pet> = ref({
  id: '',
  name: '',
  breed: '',
  species: '',
  description: '',
  birthday: undefined,
  image: { ...DEFAULT_PET_IMAGE },
});

const todayString = computed(() => dayjs().tz(userStore.timezone).format('YYYY-MM-DD'));

const birthdayInputValue = computed(() => {
  if (!existingPetObject.value.birthday) return '';
  return dayjs(existingPetObject.value.birthday).tz(userStore.timezone).format('YYYY-MM-DD');
});

onBeforeMount(() => {
  if (!existingPetObject.value?.id) {
    loadPetData();
  }
});

const dateSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value) {
    // The picked value is a calendar day in the user's timezone; compare at day
    // granularity so a user near midnight is not wrongly blocked from "today".
    const selectedDay = dayjs.tz(target.value, userStore.timezone);
    const today = dayjs().tz(userStore.timezone);
    if (!selectedDay.isAfter(today, 'day')) {
      dateErrorMessage.value = '';
      existingPetObject.value.birthday = new Date(`${target.value}T00:00:00`);
    } else {
      dateErrorMessage.value = 'Please select a date in the past or today';
    }
  }
};

const confirmUpdatePet = () => {
  showUpdateDialog.value = true;
};

const updatePet = async () => {
  const petId = existingPetObject.value.id;
  if (!petId) return;

  const petData: Pet = {
    id: petId,
    name: existingPetObject.value.name,
    species: existingPetObject.value.species,
    breed: existingPetObject.value.breed,
    description: existingPetObject.value.description,
    birthday: existingPetObject.value.birthday,
    image: normalizePetImage(existingPetObject.value.image),
  };

  const result = await petStore.updatePet(petId, petData);
  if (result.isSuccess) {
    router.push({ name: 'pet', params: { id: petData.id } });
  }
};

const deletePet = async () => {
  if (existingPetObject.value?.id) {
    const result = await petStore.deletePet(existingPetObject.value.id);
    if (result.isSuccess) {
      router.push({ name: 'home' });
    }
  }
};

const loadPetData = async () => {
  const petId = route.params.id as string;
  if (petId) {
    const petData = petStore.getPetById(petId);
    if (petData) {
      existingPetObject.value = { ...petData, image: normalizePetImage(petData.image) };
    } else {
      router.push({ name: 'pet', params: { id: petId } });
    }
  }
};

const cancelEdit = () => {
  router.push({ name: 'pet', params: { id: existingPetObject.value?.id } });
};
</script>
