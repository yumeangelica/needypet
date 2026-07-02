<script setup lang="ts">
import { RadioGroupIndicator, RadioGroupItem } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<{
  value: string;
  label?: string;
  class?: string;
}>();
</script>

<template>
  <label class="radio-group-label">
    <RadioGroupItem :value="value" :class="cn('radio-group-control', props.class)">
      <RadioGroupIndicator class="radio-group-indicator" />
    </RadioGroupItem>
    <span v-if="label" class="radio-group-text">{{ label }}</span>
  </label>
</template>

<style scoped>
.radio-group-label {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.65rem;
  padding: 0.58rem 0.95rem;
  border: 2px solid var(--color-border-field);
  border-radius: var(--radius-field);
  background: var(--color-surface-control-soft);
  box-shadow: var(--shadow-field);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s;
}

.radio-group-label:has(.radio-group-control[data-state='checked']) {
  border-color: var(--color-primary-foreground);
  background: var(--color-surface-control);
  box-shadow: var(--shadow-button);
}

.radio-group-label:focus-within {
  border-color: var(--color-card-border);
  box-shadow: var(--shadow-focus-ring), var(--shadow-field);
}

.radio-group-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  border: 2px solid var(--color-border-soft);
  border-radius: 50%;
  background: var(--color-surface-field);
  box-shadow: var(--shadow-field);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
}

.radio-group-control[data-state='checked'] {
  border-color: var(--color-primary-foreground);
}

.radio-group-control:focus-visible {
  outline: none;
}

@media (hover: hover) {
  .radio-group-label:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-control-hover);
  }

  .radio-group-label:hover .radio-group-control {
    border-color: var(--color-border-hover);
  }
}

.radio-group-label:active {
  transform: scale(0.94);
}

.radio-group-indicator {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: var(--color-primary-foreground);
}

.radio-group-text {
  color: var(--color-foreground);
  font-size: 0.875rem;
  line-height: 1.25;
  user-select: none;
}
</style>
