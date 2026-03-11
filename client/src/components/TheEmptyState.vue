<template>
  <div class="flex flex-col items-center justify-center py-10 px-5 text-center">
    <component v-if="iconComponent" :is="iconComponent" class="size-16 text-card-border mb-4 opacity-70" />
    <h3 class="m-0 mb-2 text-lg">{{ title }}</h3>
    <p class="m-0 mb-5 opacity-80 max-w-[300px]">{{ message }}</p>
    <button v-if="actionLabel" class="custom-button" @click="$emit('action')">
      <component v-if="actionIconComponent" :is="actionIconComponent" class="size-5" />
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PawPrint, CirclePlus } from 'lucide-vue-next';

const props = defineProps<{
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionIcon?: string;
}>();

defineEmits<{
  (e: 'action'): void;
}>();

// Map ionicon string names to Lucide components
const iconMap: Record<string, any> = {
  'paw-outline': PawPrint,
  'pawOutline': PawPrint,
  'add-circle-outline': CirclePlus,
  'addCircleOutline': CirclePlus,
};

const iconComponent = computed(() => props.icon ? iconMap[props.icon] || PawPrint : null);
const actionIconComponent = computed(() => props.actionIcon ? iconMap[props.actionIcon] || CirclePlus : null);
</script>
