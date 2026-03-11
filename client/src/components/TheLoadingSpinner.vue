<template>
  <div class="flex flex-col items-center justify-center py-10 px-5">
    <Loader2 class="size-10 text-primary-foreground animate-spin" />
    <p v-if="message" class="mt-3 opacity-80 text-sm">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

defineProps<{
  message?: string;
}>();
</script>
