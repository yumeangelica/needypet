import type { PetImage, PetImageKey } from '@/types/pet';

type PetImageOption = {
  key: PetImageKey;
  label: string;
  src: string;
};

export const DEFAULT_PET_IMAGE: PetImage = {
  source: 'preset',
  key: 'cat',
};

export const PET_IMAGE_OPTIONS: PetImageOption[] = [
  { key: 'dog', label: 'Dog', src: '/needypet-dog-img.png' },
  { key: 'cat', label: 'Cat', src: '/needypet-cat-img.png' },
  { key: 'bunny', label: 'Bunny', src: '/needypet-bunny-img.png' },
];

const petImagePaths = new Map(PET_IMAGE_OPTIONS.map((option) => [option.key, option.src]));
const validPetImageKeys = new Set<PetImageKey>(PET_IMAGE_OPTIONS.map((option) => option.key));

export const normalizePetImage = (image?: PetImage | null): PetImage => {
  if (image?.source === 'preset' && validPetImageKeys.has(image.key)) {
    return { source: 'preset', key: image.key };
  }

  return { ...DEFAULT_PET_IMAGE };
};

export const getPetImageSrc = (image?: PetImage | null): string => {
  const normalizedImage = normalizePetImage(image);
  return petImagePaths.get(normalizedImage.key) ?? petImagePaths.get(DEFAULT_PET_IMAGE.key) ?? '';
};
