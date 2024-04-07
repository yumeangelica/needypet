<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="form-container">
          <h3>Edit Profile:</h3>
          <ion-item>
            <ion-input v-model="editData.userName" type="text" required placeholder="Username"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input v-model="editData.email" type="email" required placeholder="Email"></ion-input>
          </ion-item>
          <ion-item @click="showModal = true">
            <ion-label class="custom-timezone-label">{{ editData.timezone || 'Select Timezone' }}</ion-label>
          </ion-item>
          <TheTimezoneSelectorModal :isOpen="showModal" @update:isOpen="showModal = $event"
            @timezoneSelected="timezone => editData.timezone = timezone" />
          <ion-item>
            <ion-input v-model="editData.currentPassword" type="password" required placeholder="Current Password"></ion-input>
          </ion-item>

          <!-- Global error message styling -->
          <div v-if="editError" class="error-message">
            {{ editError }}
          </div>

          <span class="error-message" v-if="showPasswordNotification">Please enter your current password</span>
          <ion-button class="custom-button" @click="submitForm" expand="block">Save Changes</ion-button>
          <ion-button class="custom-button" @click="router.push({ name: 'profile' })" expand="block" fill="clear">Cancel</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonItem, IonInput, IonButton, IonLabel } from '@ionic/vue';
import { ref, onBeforeMount, computed } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import TheTimezoneSelectorModal from '@/components/TheTimezoneSelectorModal.vue';


import { useAppStore } from '@/store/app';
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const userStore = useUserStore();
const router = useRouter();

const showPasswordNotification = ref(false);

const editError = ref('');

const showModal = ref(false);

const originalData = ref({});
// Placeholder for user details
const editData = ref({
  userName: '',
  email: '',
  timezone: '',
  currentPassword: '',
});

const user = ref(null);

const fetchUser = async () => {
  const userData = await userStore.getUserById(userStore.id);
  user.value = userData;
  originalData.value = { ...userData };
};


// Ensure the store is initialized from local storage or fetch latest user data if needed
onBeforeMount(async () => {

  await fetchUser();

  editData.value = {
    userName: user.value.userName,
    email: user.value.email,
    timezone: user.value.timezone,
    currentPassword: '',
  };

});

onBeforeRouteLeave((to, from, next) => {
  if (JSON.stringify(editData.value) !== JSON.stringify(originalData.value)) { // Check if the form data has changed
    editData.value = { ...originalData.value } as { userName: string; email: string; timezone: string; currentPassword: string };
  }
  next();
});


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
    editData.value.currentPassword = ''; // Clear the password field
    originalData.value = { ...editData.value };
    router.push({ name: 'profile' }); // Ensure this route name matches your router configuration
  } else {
    editError.value = 'Please check your credentials and try again.';
    setTimeout(() => {
      editError.value = '';
    }, 3000);
  }
};
</script>


<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: auto;
  padding: 20px;
  box-shadow: 4px 4px 10px var(--color-drop-shadow-pink);
  background-color: var(--color-card-background-lilac);
  border-radius: 50px;
  border: 1px solid var(--color-card-border);
}

ion-item {
  margin-bottom: 15px;
  --background: var(--color-input-background);
  --border-radius: 10px;
  --padding-start: 10px;
  --padding-end: 10px;
  --highlight-color-focused: var(--color-drop-shadow-pink);
  --color: var(--color-text-default);
  font-size: 0.85rem;
}

.custom-timezone-label {
  --color: var(--color-text-default);
}

.error-message {
  color: var(--color-error-message);
  text-align: center;
  margin-top: 15px;
  font-size: 0.8rem;
}


/* Mobile styles */
@media (max-width: 568px) {
  .form-container {
    padding: 15px;
  }

  ion-item {
    --padding-start: 8px;
    --padding-end: 8px;
    font-size: 0.8rem;
  }

}
</style>