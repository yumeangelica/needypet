<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
        <div class="edit-pet-profile-container">

          <form @submit.prevent="submitForm" class="edit-pet-profile-form">

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

            <span class="custom-error-message" v-if="showPasswordNotification">Please enter your current password</span>

            <ion-buttons class="button-container">
            <ion-button class="edit-pet-profile-button" type="submit" expand="block">Save Changes</ion-button>
              <ion-button class="edit-pet-profile-button" @click="router.push({ name: 'profile' })" expand="block" fill="clear">Cancel</ion-button>
            </ion-buttons>

            <!-- Global error message styling -->
            <div v-if="editError" class="custom-error-message">
              {{ editError }}
            </div>

          </form>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed, defineAsyncComponent } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useAppStore } from '@/store/app';
// Lazy load the components for better performance
const IonPage = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonPage));
const IonContent = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonContent));
const IonItem = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonItem));
const IonInput = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonInput));
const IonButton = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButton));
const IonLabel = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonLabel));
const TheTimezoneSelectorModal = defineAsyncComponent(() => import('@/components/TheTimezoneSelectorModal.vue'));
const IonButtons = defineAsyncComponent(() => import('@ionic/vue').then(m => m.IonButtons));

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
