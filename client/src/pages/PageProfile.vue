<template>
  <div class="app-page-root">
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container account-panel">
        <template v-if="user">
          <div class="profile-header">
            <div class="profile-title-group">
              <span class="profile-eyebrow">Pet parent</span>
              <h1 class="profile-title">{{ user.userName }}</h1>
            </div>
            <button class="settings-button profile-settings-button" aria-label="Settings" :aria-expanded="showSettings" @click="toggleSettings">
              <Settings class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div class="profile-info">
            <div class="profile-row">
              <span class="profile-label">Email</span>
              <span class="profile-value">{{ user.email }}</span>
            </div>
            <div class="profile-row email-confirmed">
              <span class="profile-label">Email verified</span>
              <span class="profile-value profile-status">
                <CheckCircle2 v-if="user.emailConfirmed" class="inline-block w-5 h-5 text-green-500" role="img" aria-label="Verified" />
                <XCircle v-else class="inline-block w-5 h-5 text-red-500" role="img" aria-label="Not verified" />
                {{ user.emailConfirmed ? 'Verified' : 'Not verified' }}
              </span>
              <button v-if="!user.emailConfirmed" class="custom-button text-sm px-2.5 py-1" :disabled="isButtonDisabled"
                aria-label="Resend confirmation email" @click="resendEmailConfirmation">
                Resend confirmation
              </button>
            </div>
            <div class="profile-row">
              <span class="profile-label">Timezone</span>
              <span class="profile-value">{{ user.timezone }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <button class="custom-button profile-action profile-logout-button" aria-label="Log out" @click="showLogoutDialog = true">
              <LogOut class="inline-block w-4 h-4 mr-1" aria-hidden="true" />
              Log Out
            </button>
            <button v-if="showSettings" class="custom-button profile-action" @click="router.push({ name: 'edit-profile' })">
              Edit My Details
            </button>
            <button v-if="showSettings" class="custom-button profile-action" @click="router.push({ name: 'change-password' })">
              Change My Paw Code
            </button>
            <button v-if="showSettings" class="custom-button profile-action profile-danger-button" @click="showDeleteDialog = true">
              <Trash2 class="inline-block w-4 h-4 mr-1" aria-hidden="true" />
              Delete Account
            </button>
          </div>
        </template>
        <TheLoadingSpinner v-else message="Loading your profile..." />
      </div>

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
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-stack);
  margin-bottom: 0.9rem;
}

.profile-title-group {
  min-width: 0;
}

.profile-eyebrow {
  display: block;
  margin-bottom: 0.15rem;
  color: var(--color-primary-foreground);
  font-size: 0.84rem;
  font-weight: 700;
  opacity: 0.84;
}

.profile-title {
  margin: 0;
  color: var(--color-primary-foreground);
  font-size: 1.35rem;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.profile-settings-button[aria-expanded="true"] {
  background: var(--color-surface-control);
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-control-hover);
}

.profile-info {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0.9rem;
  border: 2px solid var(--color-button-secondary);
  border-radius: var(--radius-lg);
  background: var(--color-surface-app);
  box-shadow: var(--shadow-field);
  overflow-wrap: anywhere;
}

.profile-row {
  display: grid;
  grid-template-columns: minmax(7rem, 0.45fr) minmax(0, 1fr);
  align-items: center;
  gap: 0.65rem;
  min-height: 2.35rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-divider);
}

.profile-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.profile-label {
  color: var(--color-primary-foreground);
  font-size: 0.86rem;
  font-weight: 700;
}

.profile-value {
  justify-self: end;
  min-width: 0;
  color: var(--color-foreground);
  font-size: 0.88rem;
  text-align: right;
  overflow-wrap: anywhere;
}

.profile-status {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
}

.email-confirmed {
  grid-template-columns: minmax(7rem, 0.45fr) minmax(0, 1fr);
}

.email-confirmed .custom-button {
  grid-column: 1 / -1;
  justify-self: end;
  min-height: 38px;
}

.profile-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}

.profile-action {
  width: 100%;
  min-height: 48px;
  padding-inline: 0.95rem;
}

.profile-logout-button {
  grid-column: 1 / -1;
  font-weight: 700;
}

.profile-danger-button {
  background: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-destructive);
}

@media (hover: hover) {
  .profile-danger-button:hover {
    background: var(--color-danger-hover);
  }
}

@media (max-width: 568px) {
  .profile-header {
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .profile-title {
    font-size: 1.15rem;
  }

  .profile-row,
  .email-confirmed {
    grid-template-columns: 1fr;
    gap: 0.2rem;
    align-items: start;
  }

  .profile-value {
    justify-self: start;
    text-align: left;
  }

  .profile-status {
    justify-content: flex-start;
  }

  .profile-actions {
    grid-template-columns: 1fr;
    gap: 0.55rem;
  }
}
</style>
