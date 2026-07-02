<template>
  <button type="button" class="small-pet-card" :aria-label="cardLabel" @click="navigateToPetView">
    <img class="pet-card-image" :src="petImageSrc" :alt="`${pet.name} picture`" />
    <h5>{{ pet.name }}</h5>
    <p class="pet-needs-count" :class="{ 'is-empty': todayNeedsCount === 0 }" :aria-hidden="todayNeedsCount === 0 ? 'true' : undefined">
      {{ todayNeedsCount > 0 ? `${todayNeedsCount} ${todayNeedsCount === 1 ? 'care task' : 'care tasks'} today` : '' }}
    </p>
  </button>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { getPetImageSrc } from '@/lib/petImages';
import { useUserStore } from '@/store/user';
import type { Pet } from '@/types/pet';

dayjs.extend(utc);
dayjs.extend(timezone);

const { pet } = defineProps<{
  pet: Pet;
}>();

const router = useRouter();
const userStore = useUserStore();

const petImageSrc = computed(() => getPetImageSrc(pet.image));

const todayNeedsCount = computed(() => {
  if (!pet.needs || pet.needs.length === 0) return 0;
  const ownerTimezone = pet.owner?.timezone || userStore.timezone || 'UTC';
  const today = dayjs().tz(ownerTimezone).format('YYYY-MM-DD');
  return pet.needs.filter((need) => need.dateFor === today).length;
});

const cardLabel = computed(() => {
  const count = todayNeedsCount.value;
  const needsText = count > 0 ? `, ${count} ${count === 1 ? 'care task' : 'care tasks'} today` : '';
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
  justify-content: center;
  align-items: center;
  gap: 7px;
  border-radius: var(--radius-2xl);
  padding: clamp(0.65rem, 2.5vw, 0.9rem);
  margin: 0;
  box-shadow: var(--shadow-soft-card);
  width: clamp(170px, 44vw, 220px);
  aspect-ratio: 0.92;
  background-color: var(--color-need-bg);
  border: 2px solid var(--color-button-secondary);
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
    box-shadow: var(--shadow-soft-hover);
    transform: translateY(-5px);
  }
}

.small-pet-card:active {
  transform: scale(0.97);
}

.small-pet-card h5 {
  font-size: clamp(1rem, 3vw, 1.12rem);
  font-weight: 700;
  width: 100%;
  text-align: center;
  margin: 0;
  padding-top: 1px;
  line-height: 1.3;
  color: var(--color-primary-foreground);
  overflow-wrap: anywhere;
}

.pet-card-image {
  width: min(86%, 170px);
  aspect-ratio: 1;
  object-fit: contain;
  flex: 0 0 auto;
  border-radius: var(--radius-xl);
  background: var(--color-surface-inner);
  border: 2px solid var(--color-button-secondary);
  box-shadow: var(--shadow-button);
}

.pet-needs-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--color-primary-foreground);
  text-align: center;
  margin: 0;
  padding: 4px 9px;
  max-width: 100%;
  min-height: calc(1.25em + 8px);
  border-radius: var(--radius-lg);
  background: var(--color-surface-control);
  border: 1px solid var(--color-button-primary);
  overflow-wrap: anywhere;
  line-height: 1.25;
}

.pet-needs-count.is-empty {
  visibility: hidden;
}

@media (max-width: 568px) {
  .small-pet-card {
    width: clamp(180px, 58vw, 220px);
    border-radius: var(--radius-xl);
  }
}
</style>
