<template>
  <AlertDialog
    :open="isOpen"
    :title="title"
    :message="message"
    :confirmLabel="confirmLabel"
    :cancelLabel="cancelLabel"
    :variant="variant"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <component v-if="iconComponent" :is="iconComponent" class="size-10 mb-3" :class="variantClass" />
  </AlertDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertDialog } from '@/components/ui';
import { Trash2 } from 'lucide-vue-next';

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

const variantClass = computed(() =>
  props.variant === 'danger' ? 'text-destructive' : 'text-primary-foreground'
);

// Map icon string props to Lucide components
const iconComponent = computed(() => {
  if (!props.icon) return null;
  if (props.icon === 'trashOutline' || props.icon === 'trash-outline') return Trash2;
  return null;
});

const handleConfirm = () => emit('confirm');
const handleCancel = () => emit('cancel');
</script>
