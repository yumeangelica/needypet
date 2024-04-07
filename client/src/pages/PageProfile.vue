<template>
  <ion-page>
    <ion-content>
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div v-if="user" class="profile-card">
          <h3 class="ion-text-center">{{ user.userName }}</h3>
          <div class="email">
            <p><strong>Email:</strong> {{ user.email }}</p>
          </div>
          <div class="timezone">
            <p><strong>Timezone:</strong> {{ user.timezone }}</p>
          </div>

          <div>
            <ion-button class="custom-button" fill="clear" @click="confirmLogout"><ion-icon :icon="exitOutline"></ion-icon>Logout</ion-button>

            <ion-button class="custom-button" fill="clear" @click="toggleSettings"><ion-icon :icon="settingsOutline"></ion-icon></ion-button>

            <ion-button v-show="showSettings" class="custom-button" fill="clear" @click="router.push({ name: 'edit-profile' })">Edit Profile</ion-button>

            <ion-button v-show="showSettings" class="custom-button" fill="clear" @click="confirmAccount"><ion-icon
                :icon="trashOutline"></ion-icon>Delete Account</ion-button>

          </div>
        </div>

        <div v-else>
          <p class="ion-text-center">Loading...</p>
        </div>
      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { useUserStore } from '@/store/user';
import { onBeforeMount, ref, computed, watch } from 'vue';
import { onBeforeRouteLeave, useRouter, useRoute } from 'vue-router';
import { trashOutline, exitOutline, settingsOutline } from 'ionicons/icons';

import { useAppStore } from '@/store/app';
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const router = useRouter();
const route = useRoute();

const userStore = useUserStore();
const user = ref(null);
const showSettings = ref(false); // Boolean value to show or hide the settings button, default is false

const toggleSettings = () => {
  showSettings.value = !showSettings.value; // Toggle the value of showSettings
};

const fetchUser = async () => {
  const userData = await userStore.getUserById(userStore.id);
  user.value = userData;
};

// Fetch the user before the component is mounted
onBeforeMount(async () => {
  await fetchUser();
});

const confirmLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    logout();
  }
};

const logout = async () => {
  await userStore.logout();
  router.push({ name: 'landing' });
};

const confirmAccount = () => {
  if (window.confirm('Are you sure you want to delete your account?')) {
    deleteAccount();
  }
};

const deleteAccount = async () => {
  const response = await userStore.deleteAccount(); // Returns true or false

  if (response) {
    await userStore.logout();
    console.log('Account deleted');
    router.push({ name: 'landing' });
  } else {
    console.log('Account could not be deleted');
  }
};

watch(route, async () => {
  await fetchUser();
});

onBeforeRouteLeave(() => {
  showSettings.value = false; // Reset the value of showSettings when leaving the page
});

</script>


<style scoped>
.profile-card {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
  background-color: var(--color-card-background-lilac);
  border-radius: 50px;
  border: solid 2px var(--color-card-border);
}

h3 {
  font-size: 1.2rem;
}

.email,
.timezone {
  color: var(--color-text-default);
  font-size: 16px;
}

/* Override ion button style */
ion-icon {
  margin-right: 5px;
}


/* Mobile styles */
@media (max-width: 568px) {
  .profile-card {
    padding: 15px;
  }

  h3 {
    font-size: 1.1rem;
  }

  .email,
  .timezone {
    font-size: 0.8rem;
  }
}
</style>
