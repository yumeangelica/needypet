<script setup lang="ts">
import { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectViewport, SelectItem, SelectItemText, SelectItemIndicator } from 'reka-ui';
import { ChevronDown, Check } from 'lucide-vue-next';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="(v) => emit('update:modelValue', v)">
    <SelectTrigger
      class="inline-flex items-center justify-between rounded-lg bg-auth-input-bg px-4 py-2.5 text-sm text-foreground gap-2 cursor-pointer border-none outline-none w-full font-sans"
    >
      <SelectValue :placeholder="placeholder || 'Select...'" />
      <ChevronDown class="size-4 text-primary-foreground" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="z-[100] min-w-[160px] rounded-xl bg-card border border-card-border shadow-lg overflow-hidden"
        position="popper"
        :side-offset="4"
      >
        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="relative flex items-center rounded-lg px-3 py-2 text-sm cursor-pointer select-none outline-none data-[highlighted]:bg-primary/20 font-sans text-foreground"
          >
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="absolute right-3">
              <Check class="size-4 text-primary-foreground" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
