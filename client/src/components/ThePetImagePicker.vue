<template>
  <div class="pet-image-picker">
    <img class="pet-image-picker-preview" :src="selectedImageSrc" :alt="previewAlt" />
    <button type="button" class="pet-image-picker-trigger" @click="isOpen = true">
      Choose picture
    </button>

    <Dialog :open="isOpen" title="Choose picture" description="Choose one built-in pet picture" maxWidth="560px"
      @update:open="isOpen = $event">
      <div class="pet-image-picker-grid" role="listbox" aria-label="Pet pictures">
        <button v-for="option in PET_IMAGE_OPTIONS" :key="option.key" type="button"
          :class="['pet-image-picker-option', { selected: option.key === selectedImage.key }]"
          :aria-selected="option.key === selectedImage.key" role="option" @click="selectImage(option.key)">
          <img :src="option.src" alt="" aria-hidden="true" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Dialog } from '@/components/ui';
import { getPetImageSrc, normalizePetImage, PET_IMAGE_OPTIONS } from '@/lib/petImages';
import type { PetImage, PetImageKey } from '@/types/pet';

const props = defineProps<{
  modelValue?: PetImage;
  petName?: string;
}>();

const emit = defineEmits<(event: 'update:modelValue', value: PetImage) => void>();

const isOpen = ref(false);

const selectedImage = computed(() => normalizePetImage(props.modelValue));
const selectedImageSrc = computed(() => getPetImageSrc(selectedImage.value));
const previewAlt = computed(() =>
  props.petName?.trim() ? `${props.petName.trim()} picture` : 'Selected pet picture',
);

const selectImage = (key: PetImageKey) => {
  emit('update:modelValue', { source: 'preset', key });
  isOpen.value = false;
};
</script>

<style scoped>
.pet-image-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 auto var(--space-stack);
}

.pet-image-picker-preview,
.pet-image-picker-option img {
  aspect-ratio: 1;
  object-fit: contain;
  background: var(--color-surface-inner);
  border: 2px solid var(--color-button-secondary);
  box-shadow: var(--shadow-button);
}

.pet-image-picker-preview {
  width: clamp(110px, 32vw, 150px);
  border-radius: var(--radius-xl);
}

.pet-image-picker-trigger {
  min-height: 36px;
  padding: 6px 16px;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-control);
  box-shadow: var(--shadow-button);
  color: var(--color-primary-foreground);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  line-height: 1.25;
  transition: border-color 0.15s, transform 0.1s, box-shadow 0.15s;
}

.pet-image-picker-trigger:focus-visible,
.pet-image-picker-option:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

@media (hover: hover) {
  .pet-image-picker-trigger:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-control-hover);
    transform: translateY(-1px);
  }
}

.pet-image-picker-trigger:active,
.pet-image-picker-option:active {
  box-shadow: var(--shadow-sm);
  transform: translateY(1px) scale(0.98);
}

.pet-image-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 14px;
}

.pet-image-picker-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 150px;
  padding: 12px;
  border: 2px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-app);
  color: var(--color-primary-foreground);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  line-height: 1.25;
  box-shadow: var(--shadow-button);
  transition: border-color 0.15s, transform 0.1s, box-shadow 0.15s;
}

.pet-image-picker-option img {
  width: 92px;
  border-radius: var(--radius-md);
}

.pet-image-picker-option.selected {
  border-color: var(--color-primary-foreground);
  box-shadow: var(--shadow-control-hover);
}

@media (hover: hover) {
  .pet-image-picker-option:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-control-hover);
    transform: translateY(-1px);
  }
}

@media (max-width: 568px) {
  .pet-image-picker-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pet-image-picker-option {
    min-height: 130px;
  }

  .pet-image-picker-option img {
    width: 74px;
  }
}
</style>
