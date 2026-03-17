<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div v-if="user" class="form-container">

        <div class="inline-container">
          <h3 class="form-header mb-0">{{ user.userName }}</h3>
          <button class="settings-button" @click="toggleSettings">
            <Settings class="w-5 h-5" />
          </button>
        </div>

        <div class="profile-info">
          <p><strong>Email:</strong> {{ user.email }}</p>
          <div class="email-confirmed">
            <p>
              <strong>Email verified</strong>
              <CheckCircle2 v-if="user.emailConfirmed" class="inline-block w-5 h-5 ml-1.5 align-middle text-green-500" />
              <XCircle v-else class="inline-block w-5 h-5 ml-1.5 align-middle text-red-500" />
            </p>
            <button v-if="!user.emailConfirmed" class="custom-button text-sm px-2.5 py-1" :disabled="isButtonDisabled"
              @click="resendEmailConfirmation">
              Resend email
            </button>
          </div>
          <p><strong>Timezone:</strong> {{ user.timezone }}</p>
        </div>

        <div class="profile-actions">
          <button class="custom-button" @click="showLogoutDialog = true">
            <LogOut class="inline-block w-4 h-4 mr-1" />
            Logout
          </button>
          <button v-show="showSettings" class="custom-button" @click="router.push({ name: 'edit-profile' })">
            Edit Profile
          </button>
          <button v-show="showSettings" class="custom-button" @click="router.push({ name: 'change-password' })">
            Change password
          </button>
          <button v-show="showSettings" class="custom-button" @click="showDeleteDialog = true">
            <Trash2 class="inline-block w-4 h-4 mr-1" />
            Delete Account
          </button>
        </div>

      </div>

      <TheLoadingSpinner v-if="!user" message="Loading profile..." />

      <TheConfirmDialog :isOpen="showLogoutDialog" title="Logout" message="Are you sure you want to logout?" confirmLabel="Logout"
        @confirm="logout(); showLogoutDialog = false" @cancel="showLogoutDialog = false" />

      <TheConfirmDialog :isOpen="showDeleteDialog" title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone." confirmLabel="Delete" variant="danger"
        icon="trashOutline" @confirm="deleteAccount(); showDeleteDialog = false" @cancel="showDeleteDialog = false" />
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, Ref } from 'vue';
import { onBeforeRouteLeave, useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { Trash2, LogOut, Settings, CheckCircle2, XCircle } from 'lucide-vue-next';
import { User } from '@/types/user';
import TheFooter from '@/components/TheFooter.vue';
import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
import TheLoadingSpinner from '@/components/TheLoadingSpinner.vue';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const user: Ref<User> = ref(null);
const showSettings = ref(false);
const isButtonDisabled = ref(false);
const showLogoutDialog = ref(false);
const showDeleteDialog = ref(false);

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const fetchUser = async () => {
  const userData = await userStore.getUserById(userStore.id);
  user.value = userData;
};

watchEffect(async () => {
  if (route.name === 'profile') {
    await fetchUser();
  }
  if (route.query.userUpdateSuccessfully === 'true') {
    appStore.addNotification('User updated successfully', 'success');
  }

  if (route.query.passwordChangedSuccessfully === 'true') {
    appStore.addNotification('Password changed successfully', 'success');
  }
});

const logout = async () => {
  await userStore.logout();
  router.push({ name: 'landing' });
  appStore.addNotification('You have been logged out', 'success');
};

const deleteAccount = async () => {
  const { isSuccess, message } = await userStore.deleteAccount();

  if (isSuccess) {
    appStore.addNotification('Your account has been deleted', 'success');
    logout();
  } else {
    appStore.addNotification(message, 'error');
  }
};

const resendEmailConfirmation = async () => {
  isButtonDisabled.value = true;

  const isSuccess = await userStore.resendEmailConfirmation();

  if (isSuccess) {
    appStore.addNotification('Please check your email for the confirmation link', 'success');
  } else {
    appStore.addNotification('Failed to resend email confirmation, please try again later', 'error');
  }
};

onBeforeRouteLeave(() => {
  showSettings.value = false;
});
</script>

<style scoped>
.profile-info {
  margin: 4px 0 8px;
}

.profile-info p {
  margin: 4px 0;
}

.email-confirmed {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
