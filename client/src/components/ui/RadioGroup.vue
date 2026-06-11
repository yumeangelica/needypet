<script setup lang="ts">
import { RadioGroupRoot } from 'reka-ui';

defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<(e: 'update:modelValue', value: string) => void>();
</script>

<template>
  <RadioGroupRoot :model-value="modelValue" @update:model-value="(v: unknown) => emit('update:modelValue', String(v))">
    <slot />
  </RadioGroupRoot>
</template>
