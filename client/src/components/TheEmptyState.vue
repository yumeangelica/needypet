<template>
  <div class="flex flex-col items-center justify-center py-10 px-5 text-center">
    <component v-if="icon" :is="icon" class="size-16 text-card-border mb-4 opacity-70" aria-hidden="true" />
    <h3 class="m-0 mb-2 text-lg">{{ title }}</h3>
    <p class="m-0 mb-5 opacity-80 max-w-[300px]">{{ message }}</p>
    <button v-if="actionLabel" class="custom-button" @click="$emit('action')">
      <component v-if="actionIcon" :is="actionIcon" class="size-5" aria-hidden="true" />
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { type Component } from 'vue';

defineProps<{
  icon?: Component;
  title: string;
  message: string;
  actionLabel?: string;
  actionIcon?: Component;
}>();

defineEmits<{
  (e: 'action'): void;
}>();
</script>
