<template>
  <div class="small-pet-card" @click="navigateToPetView">
    <h5>{{ pet.name }}</h5>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Pet } from '@/types/pet';

const { pet } = defineProps<{
  pet: Pet;
}>();

const router = useRouter();

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

.small-pet-card:hover {
  transform: translateY(-5px);
}

.small-pet-card h5 {
  font-size: 0.95rem;
  width: 100%;
  text-align: center;
  margin-top: auto;
  padding-top: 15px;
  line-height: 1.3;
}
</style>
