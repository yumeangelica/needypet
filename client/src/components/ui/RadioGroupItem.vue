<script setup lang="ts">
import { RadioGroupItem, RadioGroupIndicator } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<{
  value: string;
  class?: string;
}>();
</script>

<template>
  <RadioGroupItem
    :value="value"
    :class="cn(
      'size-5 rounded-full border-2 border-card-border bg-white flex items-center justify-center cursor-pointer',
      'data-[state=checked]:border-primary-foreground',
      props.class,
    )"
  >
    <RadioGroupIndicator class="size-2.5 rounded-full bg-primary-foreground" />
  </RadioGroupItem>
</template>
