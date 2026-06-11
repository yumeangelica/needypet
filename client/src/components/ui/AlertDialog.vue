<script setup lang="ts">
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import { useDialogTransition } from '@/composables/useDialogTransition';

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

const { internalOpen, shouldRender } = useDialogTransition(() => props.open);

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
      <DialogOverlay class="ui-dialog-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogContent
        class="ui-dialog-content fixed z-50 w-[95%] max-w-[400px] rounded-3xl bg-card border border-card-border shadow-lg p-8 flex flex-col items-center text-center">
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