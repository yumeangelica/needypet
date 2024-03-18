<template>
  <ion-page>
    <ion-content v-if="user">
      <div class="content-wrapper">
        <div class="profile-card">
          <h2>{{ user.userName }}</h2>
          <div class="email">
            <p><strong>Email:</strong> {{ user.email }}</p>
          </div>
          <div class="timezone">
            <p><strong>Timezone:</strong> {{ user.timezone }}</p>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-content v-else>
      <p>Loading...</p>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from '@ionic/vue';
import { useUserStore } from '@/store/user';
import { onBeforeMount, ref } from 'vue';

const userStore = useUserStore();
const user = ref(null);

const fetchUser = async () => {
  const userData = await userStore.getUserById(userStore.Id);
  user.value = userData;
};

// Fetch the user before the component is mounted
onBeforeMount(async () => {
  await fetchUser();
});
</script>



<style scoped>
.profile-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  background-color: white;
}

h2 {
  margin: 20px 0;
  font-size: 24px;
  color: #333;
}

.email,
.timezone {
  color: #666;
  font-size: 16px;
}
</style>
