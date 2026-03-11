<template>
  <div>
    <div :class="{ 'content-wrapper': !isMobile, 'mobile-content-wrapper': isMobile }">
      <div class="form-container">
        <form @submit.prevent="submitForm" class="form-container">
          <h3 class="form-header">Edit Profile:</h3>

          <label class="form-label">Username:</label>
          <div class="form-field">
            <input class="form-field-input" v-model="editData.userName" type="text" required placeholder="Username" />
          </div>
          <div v-if="errorDetailsObject.userName" class="custom-error-message">{{ errorDetailsObject.userName }}</div>

          <label class="form-label">Email:</label>
          <div class="form-field">
            <input class="form-field-input" v-model="editData.email" type="email" required placeholder="Email" />
          </div>
          <div v-if="errorDetailsObject.email" class="custom-error-message">{{ errorDetailsObject.email }}</div>

          <label class="form-label">Timezone:</label>
          <div class="form-field cursor-pointer" @click="showModal = true">
            <span class="form-field-input" :class="{ 'text-foreground/50': !editData.timezone }">
              {{ editData.timezone || 'Select Timezone' }}
            </span>
          </div>
          <div v-if="errorDetailsObject.timezone" class="custom-error-message">{{ errorDetailsObject.timezone }}</div>

          <TheTimezoneSelectorModal :isOpen="showModal" @update:isOpen="showModal = $event"
            @timezoneSelected="timezone => editData.timezone = timezone" />

          <label class="form-label">Current Password:</label>
          <div class="form-field">
            <input class="form-field-input" v-model="editData.currentPassword" :type="passwordFieldType" required
              placeholder="Current Password" />
            <button type="button" class="show-password-button" @click="togglePasswordVisibility">
              <Eye v-if="passwordFieldType === 'password'" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <div v-if="errorDetailsObject.currentPassword" class="custom-error-message">
            {{ errorDetailsObject.currentPassword }}
          </div>
          <span class="custom-error-message" v-if="showPasswordNotification">Please enter your current password</span>

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
import { ref, onBeforeMount, computed, Ref } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useAppStore } from '@/store/app';
import TheTimezoneSelectorModal from '@/components/TheTimezoneSelectorModal.vue';
import { User } from '@/types/user';
import { Eye, EyeOff } from 'lucide-vue-next';
import TheFooter from '@/components/TheFooter.vue';

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
    editData.value = { ...originalData.value } as { userName: string; email: string; timezone: string; currentPassword: string };
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
      currentPassword: errorDetails?.currentPassword?.[0] ? 'Password does not meet the requirements' : '',
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
