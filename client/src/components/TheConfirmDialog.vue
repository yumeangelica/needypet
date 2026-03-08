<template>
  <ion-modal :is-open="isOpen" :backdrop-dismiss="false" :can-dismiss="true" mode="md" class="confirm-dialog-modal">
    <div class="confirm-dialog">
      <ion-icon v-if="icon" :icon="icon" class="confirm-dialog-icon" :class="variantClass"></ion-icon>
      <h3 class="confirm-dialog-title">{{ title }}</h3>
      <p class="confirm-dialog-message">{{ message }}</p>
      <div class="confirm-dialog-actions">
        <ion-button class="form-button secondary" @click="handleCancel">
          {{ cancelLabel }}
        </ion-button>
        <ion-button class="form-button" :class="confirmButtonClass" @click="handleConfirm">
          {{ confirmLabel }}
        </ion-button>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonButton, IonIcon, IonModal } from '@ionic/vue';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  icon?: string;
}>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const variantClass = computed(() => `variant-${props.variant}`);
const confirmButtonClass = computed(() => props.variant === 'danger' ? 'danger' : 'primary');

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.confirm-dialog-modal {
  --max-width: 400px;
  --max-height: 320px;
  --border-radius: 24px;
}

.confirm-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
  height: 100%;
}

.confirm-dialog-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.confirm-dialog-icon.variant-default {
  color: var(--color-text-lilac);
}

.confirm-dialog-icon.variant-danger {
  color: var(--ion-color-danger, #f44336);
}

.confirm-dialog-title {
  margin: 0 0 8px 0;
  font-size: 1.15rem;
}

.confirm-dialog-message {
  margin: 0 0 24px 0;
  opacity: 0.85;
  font-size: 0.9rem;
  max-width: 320px;
}

.confirm-dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
}
</style>
