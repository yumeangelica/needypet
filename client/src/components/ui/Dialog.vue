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
      <DialogContent class="dialog-content" :style="{ maxWidth }">
        <div v-if="title || $slots.header" class="dialog-header">
          <DialogTitle v-if="title" class="dialog-title">{{ title }}</DialogTitle>
          <slot name="header" />
          <DialogClose class="dialog-close">
            Close
          </DialogClose>
        </div>
        <DialogDescription v-if="description" class="sr-only">{{ description }}</DialogDescription>
        <div class="dialog-body">
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
  position: fixed;
  z-index: 50;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  width: 95%;
  max-height: calc(100svh - 2rem);
  border: 2px solid var(--color-form-panel-border);
  border-radius: var(--radius-3xl);
  background: var(--color-form-panel-bg);
  box-shadow: var(--shadow-soft-card);
  overflow: hidden;
  transform: translate(-50%, -50%) scale(1);
  animation: content-show 200ms ease-out;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--color-form-panel-bg);
  border-bottom: 1px solid var(--color-border-divider);
}

.dialog-title {
  min-width: 0;
  color: var(--color-primary-foreground);
  font-family: var(--font-sans);
  font-size: 1.125rem;
  line-height: 1.25;
}

.dialog-body {
  max-height: min(70vh, calc(100svh - 9rem));
  padding: 1.5rem;
  background: var(--color-form-panel-bg);
  overflow-y: auto;
}

.dialog-close {
  min-height: 38px;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--color-border-muted);
  border-radius: var(--radius-lg);
  background: var(--color-surface-control);
  box-shadow: var(--shadow-sm);
  color: var(--color-primary-foreground);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  line-height: 1.25;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
}

.dialog-close:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

@media (hover: hover) {
  .dialog-close:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-control-hover);
    transform: translateY(-1px);
  }
}

.dialog-close:active {
  transform: translateY(1px) scale(0.98);
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
