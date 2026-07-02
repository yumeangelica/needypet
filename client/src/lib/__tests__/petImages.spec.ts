import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PET_IMAGE,
  getPetImageSrc,
  normalizePetImage,
  PET_IMAGE_OPTIONS,
} from '@/lib/petImages';

describe('petImages', () => {
  it('falls back to cat when no image is set', () => {
    expect(normalizePetImage(undefined)).toEqual(DEFAULT_PET_IMAGE);
    expect(getPetImageSrc(undefined)).toBe('/needypet-cat-img.png');
  });

  it('falls back to cat when an unknown key is set', () => {
    const invalidImage = { source: 'preset', key: 'dragon' } as unknown as Parameters<
      typeof normalizePetImage
    >[0];

    expect(normalizePetImage(invalidImage)).toEqual(DEFAULT_PET_IMAGE);
    expect(getPetImageSrc(invalidImage)).toBe('/needypet-cat-img.png');
  });

  it('resolves valid preset image sources', () => {
    expect(PET_IMAGE_OPTIONS.map((option) => option.key)).toEqual(['dog', 'cat', 'bunny']);
    expect(getPetImageSrc({ source: 'preset', key: 'dog' })).toBe('/needypet-dog-img.png');
    expect(getPetImageSrc({ source: 'preset', key: 'bunny' })).toBe('/needypet-bunny-img.png');
  });
});
