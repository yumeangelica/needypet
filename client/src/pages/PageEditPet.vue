<template>
  <div>
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container">
        <form @submit.prevent="confirmUpdatePet">
          <h1 class="form-header text-[1.3rem] max-[568px]:text-[1.1rem]">Edit Pet</h1>

          <div>
            <label class="form-label" for="editpet-name">Name:</label>
            <div class="form-field">
              <input id="editpet-name" class="form-field-input" v-model="existingPetObject.name" required placeholder="Enter pet's name" />
            </div>
          </div>

          <div>
            <label class="form-label" for="editpet-breed">Breed:</label>
            <div class="form-field">
              <input id="editpet-breed" class="form-field-input" v-model="existingPetObject.breed" placeholder="Enter pet's breed" />
            </div>
          </div>

          <div>
            <label class="form-label" for="editpet-species">Species:</label>
            <div class="form-field">
              <input id="editpet-species" class="form-field-input" v-model="existingPetObject.species" placeholder="Enter pet's species" />
            </div>
          </div>

          <div>
            <label class="form-label" for="editpet-description">Description</label>
            <div class="form-field">
              <textarea id="editpet-description" class="form-field-input" v-model="existingPetObject.description"
                placeholder="About the pet"></textarea>
            </div>
          </div>

          <div>
            <label class="form-label" for="editpet-birthday">Birthday</label>
            <div class="form-field">
              <input id="editpet-birthday" class="form-field-input" type="date" :value="birthdayInputValue" @change="dateSelected($event)"
                :max="todayString" :aria-invalid="dateErrorMessage ? true : undefined"
                :aria-describedby="dateErrorMessage ? 'editpet-birthday-error' : undefined" />
            </div>
            <p id="editpet-birthday-error" class="custom-error-message" v-if="dateErrorMessage" role="alert">{{ dateErrorMessage }}</p>
          </div>

          <div class="form-button-group">
            <button type="submit" class="form-button primary">Update Pet</button>
            <button type="button" @click="cancelEdit" class="form-button secondary">Cancel</button>
            <button type="button" class="form-button danger" @click="showDeleteDialog = true">
              <Trash2 class="inline-block w-4 h-4 mr-1" aria-hidden="true" />
              Delete Pet
            </button>
          </div>
        </form>
      </div>

      <TheConfirmDialog :isOpen="showUpdateDialog" title="Update Pet" message="Are you sure you want to update this pet?" confirmLabel="Update"
        @confirm="updatePet(); showUpdateDialog = false" @cancel="showUpdateDialog = false" />

      <TheConfirmDialog :isOpen="showDeleteDialog" title="Delete Pet" message="Are you sure you want to delete this pet?" confirmLabel="Delete"
        variant="danger" :icon="Trash2" @confirm="deletePet(); showDeleteDialog = false" @cancel="showDeleteDialog = false" />
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { Trash2 } from '@lucide/vue';
import { computed, onBeforeMount, type Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
import TheFooter from '@/components/TheFooter.vue';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import type { Pet } from '@/types/pet';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const route = useRoute();
const petStore = usePetStore();

const showUpdateDialog = ref(false);
const showDeleteDialog = ref(false);
const dateErrorMessage = ref('');
const existingPetObject: Ref<Pet> = ref({
  id: '',
  name: '',
  breed: '',
  species: '',
  description: '',
  birthday: null as Date | null,
});

const todayString = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const birthdayInputValue = computed(() => {
  if (!existingPetObject.value.birthday) return '';
  const d = new Date(existingPetObject.value.birthday);
  return d.toISOString().split('T')[0];
});

onBeforeMount(() => {
  if (!existingPetObject.value || !existingPetObject.value.id) {
    loadPetData();
  }
});

const dateSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value) {
    const currentDate = new Date();
    const selectedDate = new Date(target.value + 'T00:00:00');
    if (selectedDate <= currentDate) {
      dateErrorMessage.value = '';
      existingPetObject.value.birthday = selectedDate;
      existingPetObject.value.birthday.setHours(0, 0, 0, 0);
    } else {
      dateErrorMessage.value = 'Please select a date in the past or today';
    }
  }
};

const confirmUpdatePet = () => {
  showUpdateDialog.value = true;
};

const updatePet = async () => {
  const petData = {
    id: existingPetObject.value.id,
    name: existingPetObject.value.name,
    species: existingPetObject.value.species,
    breed: existingPetObject.value.breed,
    description: existingPetObject.value.description,
    birthday: existingPetObject.value.birthday,
  };

  const result = await petStore.updatePet(existingPetObject.value.id, petData);
  if (result.isSuccess) {
    router.push({ name: 'pet', params: { id: petData.id } });
  } else {
    console.error('Failed to update pet');
  }
};

const deletePet = async () => {
  if (existingPetObject.value && existingPetObject.value.id) {
    const result = await petStore.deletePet(existingPetObject.value.id);
    if (result.isSuccess) {
      router.push({ name: 'home' });
    } else {
      console.error('Failed to delete pet');
    }
  }
};

const loadPetData = async () => {
  const petId = route.params.id as string;
  if (petId) {
    const petData = await petStore.getPetById(petId);
    if (petData) {
      existingPetObject.value = { ...petData };
    } else {
      router.push({ name: 'pet', params: { id: petId } });
    }
  }
};

const cancelEdit = () => {
  router.push({ name: 'pet', params: { id: existingPetObject.value?.id } });
};
</script>
