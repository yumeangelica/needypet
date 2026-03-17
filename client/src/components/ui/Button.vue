<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class'];
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  as?: string;
}>(), {
  variant: 'default',
  size: 'default',
  as: 'button',
});

const variantClasses = {
  default: 'bg-button-primary text-primary-foreground hover:opacity-85',
  destructive: 'bg-destructive text-white hover:bg-destructive/90',
  outline: 'border border-card-border bg-transparent hover:bg-primary/10',
  ghost: 'bg-transparent hover:bg-primary/10',
  link: 'text-primary-foreground underline-offset-4 hover:underline bg-transparent',
};

const sizeClasses = {
  default: 'px-5 py-3 text-sm',
  sm: 'px-3 py-1.5 text-xs',
  lg: 'px-8 py-4 text-base',
  icon: 'size-10',
};

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-sans transition-all cursor-pointer active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.class,
  )
);
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
