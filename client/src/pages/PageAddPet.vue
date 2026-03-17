<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container">
        <h3 class="form-header">Add new pet:</h3>
        <form @submit.prevent="submitPet">
          <div>
            <label class="form-label">Name:</label>
            <div class="form-field">
              <input class="form-field-input" aria-label="Name" v-model="newPetObject.name" required placeholder="Pet's name" />
            </div>
          </div>

          <div>
            <label class="form-label">Breed:</label>
            <div class="form-field">
              <input class="form-field-input" aria-label="Breed" v-model="newPetObject.breed" placeholder="Pet's breed" />
            </div>
          </div>

          <div>
            <label class="form-label">Species:</label>
            <div class="form-field">
              <input class="form-field-input" aria-label="Species" v-model="newPetObject.species" placeholder="Pet's species" />
            </div>
          </div>

          <div>
            <label class="form-label">Description:</label>
            <div class="form-field">
              <textarea class="form-field-input" aria-label="Description" v-model="newPetObject.description" placeholder="About the pet"></textarea>
            </div>
          </div>

          <div>
            <label class="form-label">Birthday:</label>
            <div class="form-field">
              <input class="form-field-input" type="date" aria-label="Birthday" :value="birthdayInputValue" @change="dateSelected($event)"
                :max="todayString" />
            </div>
          </div>

          <div class="form-button-group">
            <button type="submit" class="form-button primary">Add Pet</button>
            <button type="button" @click="router.push({ name: 'home' })" class="form-button secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { NewPetObject } from '@/types/pet';
import TheFooter from '@/components/TheFooter.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();
const petStore = usePetStore();
const userStore = useUserStore();

const userId: Ref<string | null> = ref(userStore.id);

const newPetObject: Ref<NewPetObject> = ref({
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
  if (!newPetObject.value.birthday) return '';
  const d = new Date(newPetObject.value.birthday);
  return d.toISOString().split('T')[0];
});

const dateSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value) {
    const selectedDateTime = new Date(target.value + 'T00:00:00');
    selectedDateTime.setHours(0, 0, 0, 0);
    const currentDateTime = new Date();
    currentDateTime.setHours(0, 0, 0, 0);

    if (selectedDateTime <= currentDateTime) {
      newPetObject.value.birthday = selectedDateTime;
    }
  }
};

const formattedDate = computed(() => {
  if (!newPetObject.value.birthday) {
    return '';
  }
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(newPetObject.value.birthday).toLocaleDateString(undefined, options);
});

onBeforeRouteLeave((to, from, next) => {
  newPetObject.value = {
    name: '',
    breed: '',
    species: '',
    description: '',
    birthday: null,
  };
  next();
});

const submitPet = async () => {
  if (!newPetObject.value.name) {
    return;
  }

  if (!userId.value) {
    return;
  }

  const response = await petStore.addNewPet(newPetObject.value);
  if (response) {
    newPetObject.value = {
      name: '',
      breed: '',
      species: '',
      description: '',
      birthday: null,
    };
    router.push({ name: 'home' });
    appStore.addNotification('Pet added successfully', 'success');
  } else {
    appStore.addNotification('Failed to add pet, please try again later', 'error');
  }
};
</script>
