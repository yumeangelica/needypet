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

          <div>
            <ion-button class="setting-button" fill="clear" @click="confirmLogout"><ion-icon :icon="exitOutline"></ion-icon>Logout</ion-button>

            <ion-button class="setting-button" fill="clear" @click="toggleSettings"><ion-icon :icon="settingsOutline"></ion-icon></ion-button>

            <ion-button v-show="showSettings" class="setting-button" fill="clear" @click="navigateToEditProfile">Edit Profile</ion-button>

            <ion-button v-show="showSettings" class="setting-button" fill="clear" @click="confirmAccount"><ion-icon :icon="trashOutline"></ion-icon>Delete Account</ion-button>

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
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { useUserStore } from '@/store/user';
import { onBeforeMount, ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';

import { trashOutline, exitOutline, settingsOutline } from 'ionicons/icons';

const router = useRouter();

const userStore = useUserStore();
const user = ref(null);
const showSettings = ref(false); // Boolean value to show or hide the settings button, default is false

const toggleSettings = () => {
  showSettings.value = !showSettings.value; // Toggle the value of showSettings
};

const fetchUser = async () => {
  const userData = await userStore.getUserById(userStore.Id);
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

const navigateToEditProfile = () => {
  router.push({ name: 'edit-profile' });
};

onBeforeRouteLeave(() => {
  showSettings.value = false; // Reset the value of showSettings when leaving the page
});

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


/* Override ion button style */

ion-icon {
  margin-right: 5px;
}

ion-button {
  --background: var(--color-button-pet-page);
  --color: #fff;
  --border-radius: 20px;
  margin-top: 20px;
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
}

.setting-button {
  --color: var(--color-text-lilac) !important;
  background-color: var(--color-card-background-lilac);
  border: 1px solid var(--color-card-border);
  font-weight: bold;
  border-radius: 20px;
  margin: 10px;
  transition: background-color 0.3s ease;
}

.setting-button:hover {
  background-color: var(--color-card-background-lilac);
  box-shadow: 0.5px 0.5px 0.5px var(--color-drop-shadow-pink);
}
</style>