<template>
  <ion-page>
    <ion-content>
      <div class="pet-container" v-if="pet">
        <div class="pet-card">
          <h2 class="pet-name">{{ pet.name }}</h2>
          <div class="pet-info">
            <p><strong>Description:</strong> {{ pet.description }}</p>
            <p><strong>Breed:</strong> {{ pet.breed }}</p>
            <p><strong>Birthday:</strong> {{ pet.birthday }}</p>
          </div>

          <div class="pet-owner">
            <h3>Owner</h3>
            <p>{{ pet.owner.userName }}</p>
          </div>

          <div class="care-takers" v-if="pet.careTakers.length > 0">
            <h3>Care takers</h3>
            <ul>
              <li v-for="careTaker in pet.careTakers" :key="careTaker.id">{{ careTaker.userName }}</li>
            </ul>
          </div>

          <div class="pet-needs" v-if="pet.needs.length > 0">
            <h3>Needs:</h3>
            <ul>
              <li v-for="need in pet.needs" :key="need.id">{{ need.category }}: {{ need.description }}</li>
            </ul>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>


<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePetStore } from '@/store/pet';
import { IonPage, IonContent } from '@ionic/vue';
const pet = ref(null);

const route = useRoute();
const petStore = usePetStore();

async function getPet(id) {
  pet.value = await petStore.getPetById(id);
}

onMounted(() => {
  const id = route.params.id;
  if (id) {
    getPet(id);
  }
});
</script>



<style scoped>

.pet-container {
  display: flex;
  justify-content: center;
  padding: 10px 20px;
  margin-top: 60px; 
}

.pet-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  padding: 20px;
  max-width: 800px;
  width: 100%;
}

.pet-name {
  text-align: center;
  margin-bottom: 30px;
}

.pet-info, .pet-owner, .care-takers, .pet-needs {
  margin-bottom: 20px;
}
</style>


