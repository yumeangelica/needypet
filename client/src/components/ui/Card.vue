<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

defineOptions({
  name: 'UiCard',
});

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div :class="cn('ui-card', props.class)">
    <slot />
  </div>
</template>

<style scoped>
.ui-card {
  border: 2px solid var(--color-button-secondary);
  border-radius: var(--radius-2xl);
  background: var(--color-surface-app);
  box-shadow: var(--shadow-card);
}
</style>
