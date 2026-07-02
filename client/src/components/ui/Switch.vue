<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import { cn } from '@/lib/utils';

defineOptions({
  name: 'UiSwitch',
});

const props = defineProps<{
  checked?: boolean;
  class?: string;
  ariaLabel?: string;
}>();

const emit = defineEmits<(e: 'update:checked', value: boolean) => void>();

function handleChange(val: boolean) {
  emit('update:checked', val);
}
</script>

<template>
  <SwitchRoot :model-value="checked" @update:model-value="handleChange" :aria-label="ariaLabel" :class="cn(
    'switch-root',
    checked ? 'switch-root-checked' : 'switch-root-unchecked',
    props.class,
  )">
    <SwitchThumb :class="cn(
      'switch-thumb',
      checked ? 'translate-x-5' : 'translate-x-0',
    )" />
  </SwitchRoot>
</template>

<style scoped>
.switch-root {
  position: relative;
  display: inline-flex;
  width: 2.75rem;
  height: 1.5rem;
  flex-shrink: 0;
  align-items: center;
  padding: 0;
  border: 2px solid var(--color-border-soft);
  border-radius: 999px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.switch-root:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

.switch-root-checked {
  border-color: var(--color-border-hover);
  background: var(--color-button-primary);
}

.switch-root-unchecked {
  background: var(--color-surface-field);
}

@media (hover: hover) {
  .switch-root:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-control-hover);
  }
}

.switch-thumb {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  pointer-events: none;
  border-radius: 999px;
  background: var(--color-surface-thumb);
  box-shadow: var(--shadow-control);
  transition: transform 0.15s;
}
</style>
