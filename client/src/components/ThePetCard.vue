<template>
  <div class="small-pet-card" @click="navigateToPetView">
    <h2>{{ pet.name }}</h2>
  </div>
</template>

<script>
export default {
  props: ['pet'],
  methods: {
    /**
     * @description Navigate to the pet view by id
     */
    navigateToPetView() {
      if (this.pet && this.pet.id) {
        this.$router.push({ name: 'pet', params: { id: this.pet.id } });
      } else {
        console.error('Pet ID is missing');
      }
    }
  }
};
</script>


<style scoped>
.small-pet-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  border-radius: 50px;
  padding: 20px;
  margin: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
  min-width: 150px;
  height: 200px;
  background-color: var(--card-bg-lilac);
  border: 2px solid var(--card-border-color);
  cursor: pointer;
  transition: transform 0.3s ease;
  min-width: 200px;
}

.small-pet-card:hover {
  transform: translateY(-5px);
}

.small-pet-card h2 {
  font-size: 1rem;
  width: 100%;
  text-align: center;
  margin-top: auto;
  padding-top: 20px;
}

/* Responsiveness for mobile */
@media (max-width: 768px) {
  .small-pet-card {
    min-width: 200px;
    margin: 10px;
  }
}

</style>
