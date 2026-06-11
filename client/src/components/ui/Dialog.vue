<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import { useDialogTransition } from '@/composables/useDialogTransition';

defineOptions({
  name: 'UiDialog',
});

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    description?: string;
    maxWidth?: string;
  }>(),
  {
    maxWidth: '800px',
  },
);

const emit = defineEmits<(e: 'update:open', value: boolean) => void>();

const { internalOpen, shouldRender } = useDialogTransition(() => props.open);

function handleOpenChange(val: boolean) {
  internalOpen.value = val;
  emit('update:open', val);
}
</script>

<template>
  <DialogRoot :open="internalOpen" @update:open="handleOpenChange">
    <DialogPortal v-if="shouldRender">
      <DialogOverlay class="ui-dialog-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogContent class="ui-dialog-content fixed z-50 w-[95%] rounded-3xl bg-card border border-card-border shadow-lg overflow-hidden"
        :style="{ maxWidth }">
        <div v-if="title || $slots.header" class="bg-primary px-6 py-3 flex items-center justify-between">
          <DialogTitle v-if="title" class="text-lg font-sans text-primary-foreground">{{ title }}</DialogTitle>
          <slot name="header" />
          <DialogClose
            class="text-primary-foreground hover:opacity-70 cursor-pointer bg-transparent border-none font-sans text-sm transition-opacity">
            Close
          </DialogClose>
        </div>
        <DialogDescription v-if="description" class="sr-only">{{ description }}</DialogDescription>
        <div class="p-6 max-h-[70vh] overflow-y-auto">
          <slot />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>