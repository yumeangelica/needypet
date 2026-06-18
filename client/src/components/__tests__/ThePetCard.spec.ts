import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ThePetCard from '@/components/ThePetCard.vue';

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));

const pet = {
  id: 'pet-1',
  name: 'Milo',
  species: 'Cat',
  breed: 'Tabby',
  needs: [],
};

describe('ThePetCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
  });

  it('renders the card as a button with an accessible name', () => {
    const wrapper = mount(ThePetCard, { props: { pet } });

    const button = wrapper.get('button.small-pet-card');
    expect(button.attributes('type')).toBe('button');
    expect(button.attributes('aria-label')).toContain('Milo');
  });

  it('navigates to the pet view when activated', async () => {
    const wrapper = mount(ThePetCard, { props: { pet } });

    await wrapper.get('button.small-pet-card').trigger('click');

    expect(push).toHaveBeenCalledWith({ name: 'pet', params: { id: 'pet-1' } });
  });
});
