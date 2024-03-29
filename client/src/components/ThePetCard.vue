<template>
  <div class="pet-card" @click="navigateToPetView">
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
.pet-card {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: var(--card-bg-lilac);
}

.pet-card h2 {
  margin: 0;
}
</style>
