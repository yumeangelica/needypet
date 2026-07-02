import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PageHome from '@/pages/PageHome.vue';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';

vi.mock('@/components/TheEmptyState.vue', () => ({ default: { template: '<div />' } }));
vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));
vi.mock('@/components/TheLoadingSpinner.vue', () => ({
  default: { template: '<div class="loading-stub" />', props: ['message'] },
}));
vi.mock('@/components/ThePetCard.vue', () => ({
  default: { template: '<article class="pet-card-stub" />', props: ['pet'] },
}));

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: {} }),
  useRouter: () => ({ push }),
}));

describe('PageHome layout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
  });

  it('uses the shared pet panel layout for the pet card surface', async () => {
    const userStore = useUserStore();
    userStore.id = 'user-1';
    vi.spyOn(userStore, 'getUserById').mockResolvedValue({
      id: 'user-1',
      userName: 'Angelica',
      emailConfirmed: true,
      timezone: 'Europe/Helsinki',
    });

    const petStore = usePetStore();
    petStore.pets = [
      {
        id: 'pet-1',
        name: 'Milo',
        owner: { id: 'user-1', userName: 'Angelica', emailConfirmed: true },
        needs: [],
      },
    ] as unknown as typeof petStore.pets;

    const wrapper = mount(PageHome);
    await flushPromises();

    expect(wrapper.find('.pets-surface.pet-panel').exists()).toBe(true);
  });
});
