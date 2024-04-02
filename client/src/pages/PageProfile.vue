<template>
  <ion-page>
    <ion-content v-if="user">
      <div class="content-wrapper">
        <div class="profile-card">
          <h3>{{ user.userName }}</h3>
          <div class="email">
            <p><strong>Email:</strong> {{ user.email }}</p>
          </div>
          <div class="timezone">
            <p><strong>Timezone:</strong> {{ user.timezone }}</p>
          </div>
          <ion-button class="logout-button" fill="clear" @click="logout">Logout</ion-button>
        </div>
      </div>
    </ion-content>

    <ion-content v-else>
      <p>Loading...</p>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import { useUserStore } from '@/store/user';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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


const logout = async () => {
  await userStore.logout();
  router.push({ name: 'landing' });
};

</script>



<style scoped>
.profile-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
  text-align: center;
  background-color: var(--color-card-background-lilac);
  border-radius: 50px;
  border: solid 2px var(--color-card-border);
}

h2 {
  margin: 20px 0;
  font-size: 24px;
}

.email,
.timezone {
  color: #666;
  font-size: 16px;
}



/* Logout */
ion-buttons span {
  margin-right: 1rem;
  color: #fff;
}

/* Override ion button style */
ion-button {
  --color: var(--color-text-lilac) !important;
}

ion-icon {
  padding: 0px 5px;
}

.logout-button {
  --color: var(--color-text-lilac) !important;
  background-color: var(--color-card-background-lilac);
  border: 1px solid var(--color-card-border);
  font-weight: bold;
  border-radius: 20px;
  margin: 10px;
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: var(--color-card-background-lilac);
  box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
}
</style>
