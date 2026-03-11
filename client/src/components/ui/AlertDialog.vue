<script setup lang="ts">
import { ref, watch } from 'vue';
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

watch(() => props.open, (val) => {
  internalOpen.value = val;
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
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card border border-card-border shadow-lg p-8 flex flex-col items-center text-center">
        <DialogTitle v-if="title" class="text-lg font-sans text-primary-foreground mb-2">{{ title }}</DialogTitle>
        <DialogDescription v-if="message" class="text-sm opacity-85 max-w-xs mb-6">{{ message }}</DialogDescription>
        <slot />
        <div class="flex gap-3 justify-center w-full">
          <button class="form-button secondary" @click="handleCancel">{{ cancelLabel }}</button>
          <button
            class="form-button"
            :class="variant === 'danger' ? 'danger' : 'primary'"
            @click="handleConfirm"
          >{{ confirmLabel }}</button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
