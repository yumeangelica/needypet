<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Edit Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="form-container">
        <h3>Edit Profile:</h3>
        <ion-item>
          <ion-input v-model="editData.userName" type="text" required placeholder="Username"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input v-model="editData.email" type="email" required placeholder="Email"></ion-input>
        </ion-item>
        <ion-item>
          <ion-select v-model="editData.timezone" placeholder="Select Timezone">
            <ion-select-option v-for="zone in timezones" :value="zone" :key="zone">{{ zone }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input v-model="editData.currentPassword" type="password" required placeholder="Current Password"></ion-input>
        </ion-item>
        <span class="error-message" v-if="showPasswordNotification">Please enter your current password</span>
        <ion-button @click="submitForm" expand="block">Save Changes</ion-button>

        <ion-button @click="router.push({ name: 'profile' })" expand="block" fill="clear">Cancel</ion-button>

      </div>


    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonSelect, IonButton, IonSelectOption } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import moment from 'moment-timezone';

const userStore = useUserStore();
const router = useRouter();

const showPasswordNotification = ref(false);

// Placeholder for user details
const editData = ref({
  userName: '',
  email: '',
  timezone: '',
  currentPassword: '',
});


const user = ref(null);

const fetchUser = async () => {
  const userData = await userStore.getUserById(userStore.Id);
  user.value = userData;
};


// Ensure the store is initialized from local storage or fetch latest user data if needed
onMounted(async () => {

  await fetchUser();

  // Assuming the user details are already loaded into the store
  editData.value = {
    userName: user.value.userName,
    email: user.value.email,
    timezone: user.value.timezone,
    currentPassword: '',
  };
});

// Timezones list
const timezones = moment.tz.names();

const submitForm = async () => {

  if (!editData.value.currentPassword) {
    showPasswordNotification.value = true;
    setTimeout(() => {
      showPasswordNotification.value = false;
    }, 3000);
    return;
  }

  const isSuccess = await userStore.updateUserProfile(editData.value);
  if (isSuccess) {
    console.log('Profile updated successfully');
    router.push({ name: 'profile' }); // Ensure this route name matches your router configuration
  } else {
    console.error('Failed to update profile');
  }
};
</script>


<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
  background-color: var(--color-card-background-lilac);
  border-radius: 50px;
  border: 2px solid var(--color-card-border);
}

ion-item {
  margin-bottom: 20px;
  --background: var(--color-input-background);
  --border-radius: 10px;
  --padding-start: 10px;
  --padding-end: 10px;
  --highlight-color-focused: var(--color-drop-shadow-pink);
  --highlight-background-focused: var(--color-drop-shadow-pink);
  --color: var(--color-text-default);
}

ion-select {
  --padding-start: 10px;
  --padding-end: 10px;
  --placeholder-color: var(--color-text-lilac);
  --placeholder-opacity: 1;
}

ion-button {
  --background: var(--color-button-pet-page);
  --color: #fff;
  --border-radius: 20px;
  margin-top: 20px;
}

ion-icon {
  margin-right: 5px;
}

.error-message {
  color: var(--color-error-message);
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .form-container {
    max-width: 95%;
    margin: 20px auto;
    padding: 20px;
  }
  ion-item, ion-button {
    --border-radius: 10px;
  }
}


</style>
