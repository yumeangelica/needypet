<script setup lang="ts">
import { computed } from 'vue';
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<{
  checked?: boolean;
  class?: string;
}>();

const emit = defineEmits<{
  (e: 'update:checked', value: boolean): void;
}>();

function handleChange(val: boolean) {
  emit('update:checked', val);
}
</script>

<template>
  <SwitchRoot
    :checked="checked"
    @update:checked="handleChange"
    :class="cn(
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
      checked ? 'bg-primary-foreground' : 'bg-muted',
      props.class,
    )"
  >
    <SwitchThumb
      :class="cn(
        'pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0',
      )"
    />
  </SwitchRoot>
</template>
