<template>
  <button type="button" class="small-pet-card" :aria-label="cardLabel" @click="navigateToPetView">
    <p v-if="pet.species || pet.breed" class="pet-subtitle">{{ [pet.species, pet.breed].filter(Boolean).join(' · ') }}</p>
    <h5>{{ pet.name }}</h5>
    <p v-if="todayNeedsCount > 0" class="pet-needs-count">{{ todayNeedsCount }} {{ todayNeedsCount === 1 ? 'need' : 'needs' }} today</p>
  </button>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import type { Pet } from '@/types/pet';

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
  return pet.needs.filter((need) => need.dateFor === today).length;
});

const cardLabel = computed(() => {
  const count = todayNeedsCount.value;
  const needsText = count > 0 ? `, ${count} ${count === 1 ? 'need' : 'needs'} today` : '';
  return `View ${pet.name}${needsText}`;
});

// Navigate to the pet view page (PagePet) when the card is clicked
function navigateToPetView() {
  if (!pet?.id) return;
  router.push({ name: 'pet', params: { id: pet.id } });
}
</script>


<style scoped>
.small-pet-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius-2xl);
  padding: clamp(0.75rem, 3vw, 1rem);
  margin: 0;
  box-shadow: var(--shadow-card);
  width: clamp(148px, 40vw, 180px);
  aspect-ratio: 1;
  background-color: var(--color-card);
  border: 2px solid var(--color-card-border);
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.15s, transform 0.2s ease;
  box-sizing: border-box;
  /* Button reset (rendered as a button for keyboard accessibility) */
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
  text-align: center;
  color: inherit;
}

.small-pet-card:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

@media (hover: hover) {
  .small-pet-card:hover {
    box-shadow: var(--shadow-hover);
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
  padding-top: 10px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.pet-subtitle {
  font-size: 0.75rem;
  color: var(--color-foreground);
  opacity: 0.7;
  text-align: center;
  margin: 0;
  line-height: 1.2;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.pet-needs-count {
  font-size: 0.75rem;
  color: var(--color-foreground);
  opacity: 0.6;
  text-align: center;
  margin: 4px 0 0 0;
  max-width: 100%;
  overflow-wrap: anywhere;
}

@media (max-width: 568px) {
  .small-pet-card {
    border-radius: var(--radius-xl);
  }
}
</style>
