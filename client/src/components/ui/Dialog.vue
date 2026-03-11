<script setup lang="ts">
import { ref, watch } from 'vue';
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'reka-ui';

const props = withDefaults(defineProps<{
  open: boolean;
  title?: string;
  description?: string;
  maxWidth?: string;
}>(), {
  maxWidth: '800px',
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const internalOpen = ref(props.open);

watch(() => props.open, (val) => {
  internalOpen.value = val;
});

function handleOpenChange(val: boolean) {
  internalOpen.value = val;
  emit('update:open', val);
}
</script>

<template>
  <DialogRoot :open="internalOpen" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card border border-card-border shadow-lg overflow-hidden"
        :style="{ maxWidth }"
      >
        <div v-if="title || $slots.header" class="bg-primary px-6 py-3 flex items-center justify-between">
          <DialogTitle v-if="title" class="text-lg font-sans text-primary-foreground">{{ title }}</DialogTitle>
          <slot name="header" />
          <DialogClose class="text-primary-foreground hover:opacity-70 cursor-pointer bg-transparent border-none font-sans text-sm">
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
