<template>
  <div>
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container">
        <h1 class="form-header text-[1.3rem] max-[568px]:text-[1.1rem]">Add new pet:</h1>
        <form @submit.prevent="submitPet">
          <div>
            <label class="form-label" for="addpet-name">Name:</label>
            <div class="form-field">
              <input id="addpet-name" class="form-field-input" v-model="newPetObject.name" required placeholder="Pet's name" />
            </div>
          </div>

          <div>
            <label class="form-label" for="addpet-breed">Breed:</label>
            <div class="form-field">
              <input id="addpet-breed" class="form-field-input" v-model="newPetObject.breed" placeholder="Pet's breed" />
            </div>
          </div>

          <div>
            <label class="form-label" for="addpet-species">Species:</label>
            <div class="form-field">
              <input id="addpet-species" class="form-field-input" v-model="newPetObject.species" placeholder="Pet's species" />
            </div>
          </div>

          <div>
            <label class="form-label" for="addpet-description">Description:</label>
            <div class="form-field">
              <textarea id="addpet-description" class="form-field-input" v-model="newPetObject.description" placeholder="About the pet"></textarea>
            </div>
          </div>

          <div>
            <label class="form-label" for="addpet-birthday">Birthday:</label>
            <div class="form-field">
              <input id="addpet-birthday" class="form-field-input" type="date" :value="birthdayInputValue" @change="dateSelected($event)"
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
import { computed, type Ref, ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import TheFooter from '@/components/TheFooter.vue';
import { resultMessage } from '@/lib/apiError';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import type { NewPetObject } from '@/types/pet';

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
    const selectedDateTime = new Date(`${target.value}T00:00:00`);
    selectedDateTime.setHours(0, 0, 0, 0);
    const currentDateTime = new Date();
    currentDateTime.setHours(0, 0, 0, 0);

    if (selectedDateTime <= currentDateTime) {
      newPetObject.value.birthday = selectedDateTime;
    }
  }
};

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

  const result = await petStore.addNewPet(newPetObject.value);
  if (result.isSuccess) {
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
    appStore.addNotification(
      resultMessage(result, 'Failed to add pet, please try again later'),
      'error',
    );
  }
};
</script>
