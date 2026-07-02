<script setup lang="ts">
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import { onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
  }>(),
  {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'default',
  },
);

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const internalOpen = ref(props.open);
const shouldRender = ref(props.open);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.open,
  (val) => {
    internalOpen.value = val;
    if (val) {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      shouldRender.value = true;
    } else {
      closeTimer = setTimeout(() => {
        shouldRender.value = false;
      }, 200);
    }
  },
);

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer);
});

function handleCancel() {
  emit('cancel');
}

function handleConfirm() {
  emit('confirm');
}
</script>

<template>
  <DialogRoot :open="internalOpen" @update:open="(v) => { if (!v) handleCancel(); }">
    <DialogPortal v-if="shouldRender">
      <DialogOverlay class="alert-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogContent class="alert-content">
        <DialogTitle v-if="title" class="alert-title">{{ title }}</DialogTitle>
        <DialogDescription v-if="message" class="alert-message">{{ message }}</DialogDescription>
        <slot />
        <div class="alert-actions">
          <button class="form-button secondary" @click="handleCancel">{{ cancelLabel }}</button>
          <button class="form-button" :class="variant === 'danger' ? 'danger' : 'primary'" @click="handleConfirm">{{ confirmLabel }}</button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.alert-overlay {
  animation: alert-overlay-show 150ms ease-out;
}

.alert-overlay[data-state='closed'] {
  animation: alert-overlay-hide 100ms ease-in;
}

.alert-content {
  position: fixed;
  z-index: 50;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95%;
  max-width: 400px;
  max-height: calc(100svh - 2rem);
  padding: 2rem;
  border: 2px solid var(--color-form-panel-border);
  border-radius: var(--radius-3xl);
  background: var(--color-form-panel-bg);
  box-shadow: var(--shadow-soft-card);
  overflow-y: auto;
  overflow-wrap: anywhere;
  text-align: center;
  transform: translate(-50%, -50%) scale(1);
  animation: alert-content-show 200ms ease-out;
}

.alert-title {
  margin: 0 0 0.5rem;
  color: var(--color-primary-foreground);
  font-family: var(--font-sans);
  font-size: 1.1rem;
  line-height: 1.25;
}

.alert-message {
  max-width: 20rem;
  margin: 0 0 1.5rem;
  color: var(--color-foreground);
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.9;
}

.alert-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

.alert-content[data-state='closed'] {
  animation: alert-content-hide 150ms ease-in;
}

@keyframes alert-overlay-show {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes alert-overlay-hide {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes alert-content-show {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes alert-content-hide {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
}

@media (max-width: 568px) {
  .alert-content {
    width: calc(100vw - 1.5rem);
    padding: 1.25rem;
    border-radius: var(--radius-2xl);
  }
}
</style>
