<template>
  <AlertDialog :open="isOpen" :title="title" :message="message" :confirmLabel="confirmLabel" :cancelLabel="cancelLabel" :variant="variant"
    @confirm="handleConfirm" @cancel="handleCancel">
    <component v-if="icon" :is="icon" class="size-10 mb-3" :class="variantClass" aria-hidden="true" />
  </AlertDialog>
</template>

<script setup lang="ts">
import { type Component, computed } from 'vue';
import { AlertDialog } from '@/components/ui';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
    icon?: Component;
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

const variantClass = computed(() =>
  props.variant === 'danger' ? 'text-destructive' : 'text-primary-foreground',
);

const handleConfirm = () => emit('confirm');
const handleCancel = () => emit('cancel');
</script>
