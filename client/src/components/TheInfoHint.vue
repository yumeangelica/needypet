<template>
  <span class="info-hint" @keydown.esc="close">
    <button type="button" class="info-hint-trigger" :aria-label="label" :aria-expanded="isOpen" :aria-controls="panelId" @click.stop="toggle">
      <Info class="size-4" aria-hidden="true" />
    </button>
    <span v-if="isOpen" :id="panelId" class="info-hint-panel" :class="[`placement-${placement}`, `align-${align}`]" role="note">
      {{ text }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { Info } from '@lucide/vue';
import { onBeforeUnmount, ref, useId, watch } from 'vue';

defineOptions({
  name: 'TheInfoHint',
});

withDefaults(
  defineProps<{
    text: string;
    label?: string;
    placement?: 'top' | 'bottom' | 'right';
    align?: 'start' | 'center' | 'end';
  }>(),
  {
    label: 'More info',
    placement: 'bottom',
    align: 'start',
  },
);

const isOpen = ref(false);
const panelId = `info-hint-${useId()}`;

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

// Dismiss on outside click/tap like a regular popover
const onDocumentClick = () => close();

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('click', onDocumentClick);
  } else {
    document.removeEventListener('click', onDocumentClick);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>

<style scoped>
.info-hint {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
}

.info-hint-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: 50%;
  background: var(--color-surface-control-soft);
  box-shadow: var(--shadow-sm);
  color: var(--color-primary-foreground);
  cursor: pointer;
  transition: var(--transition-interactive);
}

.info-hint-trigger:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

@media (hover: hover) {
  .info-hint-trigger:hover {
    border-color: var(--color-border-hover);
    background: var(--color-surface-control);
    box-shadow: var(--shadow-control-hover);
  }
}

.info-hint-trigger:active {
  box-shadow: var(--shadow-sm);
  transform: scale(0.94);
}

.info-hint-panel {
  position: absolute;
  z-index: var(--z-index-popover);
  display: block;
  width: max-content;
  min-width: 170px;
  max-width: min(240px, 78vw);
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--color-card-edge);
  border-radius: var(--radius-lg);
  background: var(--color-card-bg);
  /* Popovers overlap content by design; the stronger shadow keeps the lift readable */
  box-shadow: var(--shadow-control-hover);
  color: var(--color-foreground);
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.45;
  text-align: left;
  overflow-wrap: break-word;
  white-space: normal;
}

.placement-bottom {
  top: calc(100% + 8px);
}

.placement-top {
  bottom: calc(100% + 8px);
}

/* Floats beside the trigger; used for form labels with free space to the right */
.placement-right {
  top: 50%;
  left: calc(100% + 8px);
  transform: translateY(-50%);
}

.align-start {
  left: 0;
}

.align-center {
  left: 50%;
  transform: translateX(-50%);
}

.align-end {
  right: 0;
  left: auto;
}

.placement-right.align-start,
.placement-right.align-center,
.placement-right.align-end {
  right: auto;
  left: calc(100% + 8px);
  transform: translateY(-50%);
}

/* Narrow screens: anchored popovers clip against card edges, so the hint
   becomes a small fixed sheet above the tab bar - it can never be cut off. */
@media (max-width: 568px) {
  /* Compound selector outranks the placement/align combos above */
  .info-hint .info-hint-panel {
    position: fixed;
    top: auto;
    right: auto;
    bottom: calc(var(--mobile-nav-reserve) + 12px);
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    max-width: min(92vw, 340px);
    z-index: var(--z-index-toast);
  }
}
</style>
