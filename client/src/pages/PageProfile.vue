<template>
  <div>
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div v-if="user" class="form-container">

        <div class="inline-container">
          <h1 class="form-header mb-0 text-[1.3rem] max-[568px]:text-[1.1rem]">{{ user.userName }}</h1>
          <button class="settings-button" aria-label="Settings" @click="toggleSettings">
            <Settings class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div class="profile-info">
          <p><strong>Email:</strong> {{ user.email }}</p>
          <div class="email-confirmed">
            <p>
              <strong>Email verified</strong>
              <CheckCircle2 v-if="user.emailConfirmed" class="inline-block w-5 h-5 ml-1.5 align-middle text-green-500" role="img" aria-label="Verified" />
              <XCircle v-else class="inline-block w-5 h-5 ml-1.5 align-middle text-red-500" role="img" aria-label="Not verified" />
            </p>
            <button v-if="!user.emailConfirmed" class="custom-button text-sm px-2.5 py-1" :disabled="isButtonDisabled"
              aria-label="Resend confirmation email" @click="resendEmailConfirmation">
              Resend confirmation
            </button>
          </div>
          <p><strong>Timezone:</strong> {{ user.timezone }}</p>
        </div>

        <div class="profile-actions">
          <button class="custom-button" aria-label="Log out" @click="showLogoutDialog = true">
            <LogOut class="inline-block w-4 h-4 mr-1" aria-hidden="true" />
            Log Out
          </button>
          <button v-if="showSettings" class="custom-button" @click="router.push({ name: 'edit-profile' })">
            Edit My Details
          </button>
          <button v-if="showSettings" class="custom-button" @click="router.push({ name: 'change-password' })">
            Change My Paw Code
          </button>
          <button v-if="showSettings" class="custom-button" @click="showDeleteDialog = true">
            <Trash2 class="inline-block w-4 h-4 mr-1" aria-hidden="true" />
            Delete Account
          </button>
        </div>

      </div>

      <TheLoadingSpinner v-if="!user" message="Loading your profile..." />

      <TheConfirmDialog :isOpen="showLogoutDialog" title="Heading out?" message="Ready to say goodbye for now?" confirmLabel="Log Out"
        @confirm="logout(); showLogoutDialog = false" @cancel="showLogoutDialog = false" />

      <TheConfirmDialog :isOpen="showDeleteDialog" title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone." confirmLabel="Delete" variant="danger"
        :icon="Trash2" @confirm="deleteAccount(); showDeleteDialog = false" @cancel="showDeleteDialog = false" />
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, LogOut, Settings, Trash2, XCircle } from '@lucide/vue';
import { computed, type Ref, ref, watchEffect } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
import TheFooter from '@/components/TheFooter.vue';
import TheLoadingSpinner from '@/components/TheLoadingSpinner.vue';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import type { User } from '@/types/user';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const user: Ref<User | null> = ref(null);
const showSettings = ref(false);
const isButtonDisabled = ref(false);
const showLogoutDialog = ref(false);
const showDeleteDialog = ref(false);

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const fetchUser = async () => {
  if (!userStore.id) return;
  const userData = await userStore.getUserById(userStore.id);
  user.value = userData;
};

watchEffect(async () => {
  if (route.name === 'profile') {
    await fetchUser();
  }
  if (route.query.userUpdateSuccessfully === 'true') {
    appStore.addNotification('Your details are all updated! 🐾', 'success');
  }

  if (route.query.passwordChangedSuccessfully === 'true') {
    appStore.addNotification('Your new secret paw code is saved! 🐾', 'success');
  }
});

const logout = async () => {
  await userStore.logout();
  router.push({ name: 'landing' });
  appStore.addNotification('See you next time, pet parent! 👋', 'success');
};

const deleteAccount = async () => {
  const { isSuccess, message } = await userStore.deleteAccount();

  if (isSuccess) {
    appStore.addNotification('Your account and all pet memories have been deleted.', 'success');
    logout();
  } else {
    appStore.addNotification(
      message ?? "We couldn't delete your account. Please try again.",
      'error',
    );
  }
};

const resendEmailConfirmation = async () => {
  isButtonDisabled.value = true;

  const result = await userStore.resendEmailConfirmation();

  if (result.isSuccess) {
    appStore.addNotification('Check your inbox! We sent you the confirmation link 📧', 'success');
  } else {
    isButtonDisabled.value = false;
    appStore.addNotification(
      result.message || "We couldn't resend the confirmation email. Please try again.",
      'error',
    );
  }
};

onBeforeRouteLeave(() => {
  showSettings.value = false;
});
</script>

<style scoped>
.profile-info {
  margin: 4px 0 8px;
  overflow-wrap: anywhere;
}

.profile-info p {
  margin: 4px 0;
  line-height: 1.45;
}

.email-confirmed {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
