<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

defineOptions({
  name: 'UiButton',
});

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class'];
    variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    as?: string;
  }>(),
  {
    variant: 'default',
    size: 'default',
    as: 'button',
  },
);

const variantClasses = {
  default: 'ui-button-default',
  destructive: 'ui-button-destructive',
  outline: 'ui-button-outline',
  ghost: 'ui-button-ghost',
  link: 'ui-button-link',
};

const sizeClasses = {
  default: 'ui-button-default-size',
  sm: 'ui-button-sm',
  lg: 'ui-button-lg',
  icon: 'ui-button-icon',
};

const classes = computed(() =>
  cn('ui-button', variantClasses[props.variant], sizeClasses[props.size], props.class),
);
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  font-family: var(--font-sans);
  line-height: 1.25;
  color: var(--color-primary-foreground);
  cursor: pointer;
  box-shadow: var(--shadow-button);
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s, opacity 0.15s;
}

.ui-button:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

@media (hover: hover) {
  .ui-button:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-control-hover);
    transform: translateY(-1px);
  }
}

.ui-button:active {
  box-shadow: var(--shadow-sm);
  transform: translateY(1px) scale(0.98);
}

.ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.ui-button-default,
.ui-button-outline {
  background: var(--color-button-primary);
}

.ui-button-ghost {
  background: var(--color-surface-control-soft);
}

.ui-button-link {
  min-height: auto;
  padding: 0;
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.ui-button-destructive {
  border-color: var(--color-danger-border);
  background: var(--color-danger-soft);
  color: var(--color-destructive);
}

@media (hover: hover) {
  .ui-button-default:hover,
  .ui-button-outline:hover {
    background: var(--color-button-primary-hover);
  }

  .ui-button-ghost:hover {
    background: var(--color-surface-control);
  }

  .ui-button-link:hover {
    background: transparent;
    box-shadow: none;
    transform: none;
  }

  .ui-button-destructive:hover {
    background: var(--color-danger-hover);
  }
}

.ui-button-default-size {
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
}

.ui-button-sm {
  min-height: 38px;
  padding: 0.45rem 0.8rem;
  font-size: 0.75rem;
}

.ui-button-lg {
  padding: 0.95rem 1.8rem;
  font-size: 1rem;
}

.ui-button-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
}
</style>
