<template>
  <div>
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container">
        <h1 class="form-header text-[1.3rem] max-[568px]:text-[1.1rem]">Welcome a new furry friend! 🐾</h1>
        <form @submit.prevent="submitPet">
          <div>
            <label class="form-label" for="addpet-name">Name</label>
            <div class="form-field">
              <input id="addpet-name" class="form-field-input" v-model="newPetObject.name" required placeholder="Fluffy, Whiskers, Buddy..." />
            </div>
          </div>

          <div>
            <label class="form-label" for="addpet-breed">Breed</label>
            <div class="form-field">
              <input id="addpet-breed" class="form-field-input" v-model="newPetObject.breed" placeholder="Golden Retriever, Siamese..." />
            </div>
          </div>

          <div>
            <label class="form-label" for="addpet-species">What kind of pet?</label>
            <div class="form-field">
              <input id="addpet-species" class="form-field-input" v-model="newPetObject.species" placeholder="Dog, cat, rabbit..." />
            </div>
          </div>

          <div>
            <label class="form-label" for="addpet-description">Tell us about them</label>
            <div class="form-field">
              <textarea id="addpet-description" class="form-field-input" v-model="newPetObject.description" placeholder="Personality, quirks, favourite treats..."></textarea>
            </div>
          </div>

          <div>
            <label class="form-label" for="addpet-birthday">When were they born?</label>
            <div class="form-field">
              <input id="addpet-birthday" class="form-field-input" type="date" :value="birthdayInputValue" @change="dateSelected($event)"
                :max="todayString" />
            </div>
          </div>

          <div class="form-button-group">
            <button type="submit" aria-label="Add pet" class="form-button primary">Welcome Them Home</button>
            <button type="button" @click="router.push({ name: 'home' })" class="form-button secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { computed, type Ref, ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import TheFooter from '@/components/TheFooter.vue';
import { resultMessage } from '@/lib/apiError';
import { useAppStore } from '@/store/app';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import type { NewPetObject } from '@/types/pet';

dayjs.extend(utc);
dayjs.extend(timezone);

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

const todayString = computed(() => dayjs().tz(userStore.timezone).format('YYYY-MM-DD'));

const birthdayInputValue = computed(() => {
  if (!newPetObject.value.birthday) return '';
  return dayjs(newPetObject.value.birthday).tz(userStore.timezone).format('YYYY-MM-DD');
});

const dateSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value) {
    // The picked value is a calendar day in the user's timezone; compare at day
    // granularity so a user near midnight is not wrongly blocked from "today".
    const selectedDay = dayjs.tz(target.value, userStore.timezone);
    const today = dayjs().tz(userStore.timezone);

    if (!selectedDay.isAfter(today, 'day')) {
      newPetObject.value.birthday = new Date(`${target.value}T00:00:00`);
    }
  }
};

onBeforeRouteLeave(() => {
  newPetObject.value = {
    name: '',
    breed: '',
    species: '',
    description: '',
    birthday: null,
  };
  return true;
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
    appStore.addNotification('Welcome to the family! 🐾', 'success');
  } else {
    appStore.addNotification(
      resultMessage(result, "We couldn't welcome your new friend. Please try again."),
      'error',
    );
  }
};
</script>
