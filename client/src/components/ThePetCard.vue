<template>
  <div class="small-pet-card" @click="navigateToPetView">
    <p v-if="pet.species || pet.breed" class="pet-subtitle">{{ [pet.species, pet.breed].filter(Boolean).join(' · ') }}</p>
    <h5>{{ pet.name }}</h5>
    <p v-if="todayNeedsCount > 0" class="pet-needs-count">{{ todayNeedsCount }} {{ todayNeedsCount === 1 ? 'need' : 'needs' }} today</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { Pet } from '@/types/pet';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const { pet } = defineProps<{
  pet: Pet;
}>();

const router = useRouter();
const userStore = useUserStore();

const todayNeedsCount = computed(() => {
  if (!pet.needs || pet.needs.length === 0) return 0;
  const today = dayjs().tz(userStore.timezone).format('YYYY-MM-DD');
  return pet.needs.filter(need => need.dateFor === today).length;
});

// Navigate to the pet view page (PagePet) when the card is clicked
function navigateToPetView() {
  if (pet && pet.id) {
    router.push({ name: 'pet', params: { id: pet.id } });
  } else {
    console.error('Pet ID is missing');
  }
}
</script>


<style scoped>
.small-pet-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  border-radius: 40px;
  padding: 15px;
  margin: 8px;
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
  min-width: 140px;
  height: 180px;
  width: 180px;
  background-color: var(--color-card-background-lilac);
  border: 2px solid var(--color-card-border);
  cursor: pointer;
  transition: transform 0.3s ease;
  box-sizing: border-box;
}

@media (hover: hover) {
  .small-pet-card:hover {
    transform: translateY(-5px);
  }
}

.small-pet-card:active {
  transform: scale(0.97);
}

.small-pet-card h5 {
  font-size: 0.95rem;
  width: 100%;
  text-align: center;
  margin-top: auto;
  padding-top: 15px;
  line-height: 1.3;
}

.pet-subtitle {
  font-size: 0.7rem;
  color: var(--color-text-default);
  opacity: 0.7;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

.pet-needs-count {
  font-size: 0.7rem;
  color: var(--color-text-default);
  opacity: 0.6;
  text-align: center;
  margin: 4px 0 0 0;
}
</style>
