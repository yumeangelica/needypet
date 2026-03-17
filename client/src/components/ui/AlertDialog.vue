<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'reka-ui';

const props = withDefaults(defineProps<{
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const internalOpen = ref(props.open);
const shouldRender = ref(props.open);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => props.open, (val) => {
  internalOpen.value = val;
  if (val) {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    shouldRender.value = true;
  } else {
    closeTimer = setTimeout(() => {
      shouldRender.value = false;
    }, 200);
  }
});

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
      <DialogContent
        class="alert-content fixed z-50 w-[95%] max-w-[400px] rounded-3xl bg-card border border-card-border shadow-lg p-8 flex flex-col items-center text-center">
        <DialogTitle v-if="title" class="text-lg font-sans text-primary-foreground mb-2">{{ title }}</DialogTitle>
        <DialogDescription v-if="message" class="text-sm opacity-85 max-w-xs mb-6">{{ message }}</DialogDescription>
        <slot />
        <div class="flex gap-3 justify-center w-full">
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
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(1);
  animation: alert-content-show 200ms ease-out;
}

.alert-content[data-state='closed'] {
  animation: alert-content-hide 150ms ease-in;
}

@keyframes alert-overlay-show {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes alert-overlay-hide {
  from { opacity: 1; }
  to { opacity: 0; }
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
</style>