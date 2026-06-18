<template>
  <div>
    <div id="main-content" role="main" tabindex="-1" :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container">
        <form @submit.prevent="submitForm">
          <h1 class="form-header text-[1.3rem] max-[568px]:text-[1.1rem]">Edit Profile:</h1>

          <label class="form-label" for="editprofile-username">Username:</label>
          <div class="form-field">
            <input id="editprofile-username" class="form-field-input" v-model="editData.userName" type="text" required placeholder="Username"
              :aria-invalid="errorDetailsObject.userName ? true : undefined"
              :aria-describedby="errorDetailsObject.userName ? 'editprofile-username-error' : undefined" />
          </div>
          <div v-if="errorDetailsObject.userName" id="editprofile-username-error" class="custom-error-message" role="alert">
            {{ errorDetailsObject.userName }}
          </div>

          <label class="form-label" for="editprofile-email">Email:</label>
          <div class="form-field">
            <input id="editprofile-email" class="form-field-input" v-model="editData.email" type="email" required placeholder="Email"
              :aria-invalid="errorDetailsObject.email ? true : undefined"
              :aria-describedby="errorDetailsObject.email ? 'editprofile-email-error' : undefined" />
          </div>
          <div v-if="errorDetailsObject.email" id="editprofile-email-error" class="custom-error-message" role="alert">{{ errorDetailsObject.email }}</div>

          <label class="form-label">Timezone:</label>
          <div class="form-field cursor-pointer" role="button" tabindex="0" aria-haspopup="dialog"
            :aria-label="`Select timezone, current: ${editData.timezone || 'none'}`"
            :aria-describedby="errorDetailsObject.timezone ? 'editprofile-timezone-error' : undefined" @click="showModal = true"
            @keydown.enter.prevent="showModal = true" @keydown.space.prevent="showModal = true">
            <span class="form-field-input" :class="{ 'text-foreground/70': !editData.timezone }">
              {{ editData.timezone || 'Select Timezone' }}
            </span>
          </div>
          <div v-if="errorDetailsObject.timezone" id="editprofile-timezone-error" class="custom-error-message" role="alert">
            {{ errorDetailsObject.timezone }}
          </div>

          <TheTimezoneSelectorModal :isOpen="showModal" @update:isOpen="showModal = $event"
            @timezoneSelected="timezone => editData.timezone = timezone" />

          <label class="form-label" for="editprofile-current-password">Current Password:</label>
          <div class="form-field">
            <input id="editprofile-current-password" class="form-field-input" v-model="editData.currentPassword" :type="passwordFieldType" required
              placeholder="Current Password" :aria-invalid="errorDetailsObject.currentPassword ? true : undefined"
              :aria-describedby="errorDetailsObject.currentPassword ? 'editprofile-current-password-error' : undefined" />
            <button type="button" class="show-password-button" :aria-label="passwordFieldType === 'password' ? 'Show password' : 'Hide password'" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" aria-hidden="true" />
              <EyeOff v-else class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div v-if="errorDetailsObject.currentPassword" id="editprofile-current-password-error" class="custom-error-message" role="alert">
            {{ errorDetailsObject.currentPassword }}
          </div>
          <span class="custom-error-message" v-if="showPasswordNotification" role="alert">Please enter your current password</span>

          <div class="form-button-group">
            <button class="form-button primary" type="submit">Save Changes</button>
            <button type="button" class="form-button secondary" @click="router.push({ name: 'profile' })">Cancel</button>
          </div>

          <div v-if="errorMessage" class="custom-error-message">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next';
import { computed, onBeforeMount, type Ref, ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import TheFooter from '@/components/TheFooter.vue';
import TheTimezoneSelectorModal from '@/components/TheTimezoneSelectorModal.vue';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import type { User } from '@/types/user';

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile);

const userStore = useUserStore();
const router = useRouter();

const showPasswordNotification = ref(false);
const passwordFieldType = ref<'password' | 'text'>('password');

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const errorMessage = ref('');
const errorDetailsObject = ref({
  userName: '',
  email: '',
  timezone: '',
  currentPassword: '',
});

const showModal = ref(false);

const originalData = ref({});
const editData = ref({
  userName: '',
  email: '',
  timezone: '',
  currentPassword: '',
});

const user: Ref<User> = ref(null);

const fetchUser = async () => {
  const userData = await userStore.getUserById(userStore.id);
  user.value = userData;
  originalData.value = { ...userData };
};

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
  if (JSON.stringify(editData.value) !== JSON.stringify(originalData.value)) {
    editData.value = { ...originalData.value } as {
      userName: string;
      email: string;
      timezone: string;
      currentPassword: string;
    };
  }
  next();
});

const submitForm = async () => {
  if (!editData.value.currentPassword) {
    showPasswordNotification.value = true;
    setTimeout(() => {
      showPasswordNotification.value = false;
    }, 5000);
    return;
  }

  const { isSuccess, message, errorDetails } = await userStore.updateUserProfile(editData.value);
  if (isSuccess) {
    editData.value.currentPassword = '';
    originalData.value = { ...editData.value };
    router.push({ name: 'profile', query: { userUpdateSuccessfully: 'true' } });
  } else {
    errorDetailsObject.value = {
      userName: errorDetails?.userName?.[0] || '',
      email: errorDetails?.email?.[0] || '',
      timezone: errorDetails?.timezone?.[0] || '',
      currentPassword: errorDetails?.currentPassword?.[0]
        ? 'Password does not meet the requirements'
        : '',
    };
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = '';
      errorDetailsObject.value = {
        userName: '',
        email: '',
        timezone: '',
        currentPassword: '',
      };
    }, 5000);
  }
};
</script>
