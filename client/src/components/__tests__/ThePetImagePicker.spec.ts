import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ThePetImagePicker from '@/components/ThePetImagePicker.vue';

vi.mock('@/components/ui', () => ({
  Dialog: {
    template: '<div v-if="open" class="dialog-stub"><slot /></div>',
    props: ['open', 'title', 'description', 'maxWidth'],
    emits: ['update:open'],
  },
}));

describe('ThePetImagePicker', () => {
  it('uses pressed button state instead of listbox semantics', async () => {
    const wrapper = mount(ThePetImagePicker, {
      props: {
        modelValue: { source: 'preset', key: 'cat' },
      },
    });

    await wrapper.get('.pet-image-picker-trigger').trigger('click');

    const grid = wrapper.get('.pet-image-picker-grid');
    expect(grid.attributes('role')).toBeUndefined();

    const buttons = wrapper.findAll('.pet-image-picker-option');
    expect(buttons).toHaveLength(3);
    expect(buttons.every((button) => button.attributes('role') === undefined)).toBe(true);
    expect(buttons.map((button) => button.attributes('aria-pressed'))).toEqual([
      'false',
      'true',
      'false',
    ]);
  });
});
