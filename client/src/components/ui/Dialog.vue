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
import { onBeforeUnmount, ref, watch } from 'vue';

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

function handleOpenChange(val: boolean) {
  internalOpen.value = val;
  emit('update:open', val);
}
</script>

<template>
  <DialogRoot :open="internalOpen" @update:open="handleOpenChange">
    <DialogPortal v-if="shouldRender">
      <DialogOverlay class="dialog-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogContent class="dialog-content fixed z-50 w-[95%] rounded-3xl bg-card border border-card-border shadow-lg overflow-hidden flex flex-col"
        :style="{ maxWidth }">
        <div v-if="title || $slots.header" class="dialog-header bg-primary px-6 py-3 flex items-center justify-between gap-3">
          <DialogTitle v-if="title" class="text-lg leading-tight font-sans text-primary-foreground min-w-0">{{ title }}</DialogTitle>
          <slot name="header" />
          <DialogClose
            class="text-primary-foreground hover:opacity-70 cursor-pointer bg-transparent border-none rounded-lg px-2 py-1 font-sans text-sm transition-opacity focus-visible:outline-2 focus-visible:outline-primary-foreground focus-visible:outline-offset-2">
            Close
          </DialogClose>
        </div>
        <DialogDescription v-if="description" class="sr-only">{{ description }}</DialogDescription>
        <div class="dialog-body p-6 overflow-y-auto">
          <slot />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.dialog-overlay {
  animation: overlay-show 150ms ease-out;
}

.dialog-overlay[data-state='closed'] {
  animation: overlay-hide 100ms ease-in;
}

.dialog-content {
  left: 50%;
  top: 50%;
  max-height: calc(100svh - 2rem);
  transform: translate(-50%, -50%) scale(1);
  animation: content-show 200ms ease-out;
}

.dialog-body {
  max-height: min(70vh, calc(100svh - 9rem));
}

.dialog-content[data-state='closed'] {
  animation: content-hide 150ms ease-in;
}

@keyframes overlay-show {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes overlay-hide {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes content-show {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes content-hide {
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
  .dialog-content {
    width: calc(100vw - 1.5rem);
    max-height: calc(100svh - 1.5rem);
    border-radius: var(--radius-2xl);
  }

  .dialog-header {
    padding: 0.75rem 1rem;
  }

  .dialog-body {
    max-height: calc(100svh - 7rem);
    padding: 1rem;
  }
}
</style>
