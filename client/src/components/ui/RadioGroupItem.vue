<script setup lang="ts">
import { RadioGroupItem, RadioGroupIndicator } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<{
  value: string;
  label?: string;
  class?: string;
}>();
</script>

<template>
  <label class="inline-flex items-center gap-2 cursor-pointer">
    <RadioGroupItem :value="value" :class="cn(
      'size-5 rounded-full border-2 border-card-border bg-white flex items-center justify-center cursor-pointer shrink-0',
      'data-[state=checked]:border-primary-foreground',
      'focus-visible:outline-2 focus-visible:outline-primary-foreground focus-visible:outline-offset-2',
      props.class,
    )">
      <RadioGroupIndicator class="size-2.5 rounded-full bg-primary-foreground" />
    </RadioGroupItem>
    <span v-if="label" class="text-sm select-none">{{ label }}</span>
  </label>
</template>
