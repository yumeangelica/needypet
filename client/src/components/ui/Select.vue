<script setup lang="ts">
import { Check, ChevronDown } from '@lucide/vue';
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui';

defineOptions({
  name: 'UiSelect',
});

defineProps<{
  modelValue?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  ariaLabel?: string;
}>();

const emit = defineEmits<(e: 'update:modelValue', value: string) => void>();
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="(v) => emit('update:modelValue', v)">
    <SelectTrigger :aria-label="ariaLabel" class="select-trigger">
      <SelectValue :placeholder="placeholder || 'Select...'" />
      <ChevronDown class="size-4 text-primary-foreground" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent class="select-content" position="popper" :side-offset="4">
        <SelectViewport class="p-1">
          <SelectItem v-for="option in options" :key="option.value" :value="option.value" class="select-item">
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="absolute right-3">
              <Check class="size-4 text-primary-foreground" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style scoped>
.select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  min-height: 50px;
  padding: 13px 20px;
  border: 2px solid var(--color-form-field-border);
  border-radius: var(--radius-lg);
  background: var(--color-form-field-bg);
  box-shadow: var(--shadow-field);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  font-size: 0.86rem;
  line-height: 1.4;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
}

.select-trigger:focus-visible {
  border-color: var(--color-card-border);
  box-shadow: var(--shadow-focus-ring);
  outline: none;
}

@media (hover: hover) {
  .select-trigger:hover {
    border-color: var(--color-border-hover);
  }
}

.select-content {
  z-index: 100;
  min-width: 160px;
  overflow: hidden;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-inner);
  box-shadow: var(--shadow-soft-card);
}

.select-item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 38px;
  padding: 0.5rem 2.25rem 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
  user-select: none;
}

.select-item[data-highlighted] {
  background: var(--color-surface-control);
  color: var(--color-primary-foreground);
}
</style>
