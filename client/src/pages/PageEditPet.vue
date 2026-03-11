<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container">
        <form @submit.prevent="confirmUpdatePet">
          <h3 class="form-header">Edit Pet</h3>

          <div>
            <label class="form-label">Name:</label>
            <div class="form-field">
              <input class="form-field-input" aria-label="Name" v-model="existingPetObject.name" required
                placeholder="Enter pet's name" />
            </div>
          </div>

          <div>
            <label class="form-label">Breed:</label>
            <div class="form-field">
              <input class="form-field-input" aria-label="Breed" v-model="existingPetObject.breed"
                placeholder="Enter pet's breed" />
            </div>
          </div>

          <div>
            <label class="form-label">Species:</label>
            <div class="form-field">
              <input class="form-field-input" aria-label="Species" v-model="existingPetObject.species"
                placeholder="Enter pet's species" />
            </div>
          </div>

          <div>
            <label class="form-label">Description</label>
            <div class="form-field">
              <textarea class="form-field-input" aria-label="Description" v-model="existingPetObject.description"
                placeholder="About the pet"></textarea>
            </div>
          </div>

          <div>
            <label class="form-label">Birthday</label>
            <div class="form-field">
              <input class="form-field-input" type="date" aria-label="Birthday"
                :value="birthdayInputValue" @change="dateSelected($event)" :max="todayString" />
            </div>
            <p class="custom-error-message" v-if="dateErrorMessage">{{ dateErrorMessage }}</p>
          </div>

          <div class="form-button-group">
            <button type="submit" class="form-button primary">Update Pet</button>
            <button type="button" @click="cancelEdit" class="form-button secondary">Cancel</button>
            <button type="button" class="form-button danger" @click="showDeleteDialog = true">
              <Trash2 class="inline-block w-4 h-4 mr-1" />
              Delete Pet
            </button>
          </div>
        </form>
      </div>

      <TheConfirmDialog :isOpen="showUpdateDialog" title="Update Pet" message="Are you sure you want to update this pet?"
        confirmLabel="Update" @confirm="updatePet(); showUpdateDialog = false" @cancel="showUpdateDialog = false" />

      <TheConfirmDialog :isOpen="showDeleteDialog" title="Delete Pet" message="Are you sure you want to delete this pet?"
        confirmLabel="Delete" variant="danger" icon="trashOutline"
        @confirm="deletePet(); showDeleteDialog = false" @cancel="showDeleteDialog = false" />
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeMount, Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useAppStore } from '@/store/app';
import { Pet } from '@/types/pet';
import { Trash2 } from 'lucide-vue-next';
import TheFooter from '@/components/TheFooter.vue';
import TheConfirmDialog from '@/components/TheConfirmDialog.vue';

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

const formattedDate = computed(() => {
  return existingPetObject.value.birthday
    ? new Date(existingPetObject.value.birthday).toLocaleDateString('en-GB')
    : '';
});

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

  const success = await petStore.updatePet(existingPetObject.value.id, petData);
  if (success) {
    router.push({ name: 'pet', params: { id: petData.id } });
  } else {
    console.error('Failed to update pet');
  }
};

const confirmDeletePet = () => {
  showDeleteDialog.value = true;
};

const deletePet = async () => {
  if (existingPetObject.value && existingPetObject.value.id) {
    const success = await petStore.deletePet(existingPetObject.value.id);
    if (success) {
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
