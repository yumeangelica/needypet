import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import PagePet from '@/pages/PagePet.vue';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';
import type { Need, Pet } from '@/types/pet';

vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));
vi.mock('@/components/TheNeedCard.vue', () => ({
  default: {
    props: ['need', 'petId', 'todayDate'],
    template:
      '<article class="need-card-stub">{{ need.category }} {{ need.description }}</article>',
  },
}));

const today = '2026-07-02';

const makeNeed = (overrides: Partial<Need> = {}): Need => ({
  id: 'need-1',
  category: 'Medicine',
  description: 'Morning drops',
  dateFor: today,
  duration: { value: 10, unit: 'minutes' },
  completed: false,
  isActive: true,
  ...overrides,
});

const makePet = (overrides: Partial<Pet> = {}): Pet => ({
  id: 'pet-1',
  name: 'Testikissa',
  species: 'Cat',
  breed: 'Tabby',
  description: 'Tiny boss',
  birthday: new Date('2024-01-01'),
  owner: {
    id: 'owner-1',
    userName: 'Angelica',
    timezone: 'Europe/Helsinki',
    emailConfirmed: true,
  },
  careTakers: [],
  needs: [makeNeed()],
  ...overrides,
});

const mountPagePet = async ({ waitForAsync = true } = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/pets/:id', name: 'pet', component: PagePet }],
  });

  await router.push('/pets/pet-1');
  await router.isReady();

  const wrapper = mount(PagePet, {
    global: {
      plugins: [router],
    },
  });

  if (waitForAsync) {
    await flushPromises();
  }
  await nextTick();

  return wrapper;
};

describe('PagePet - care tasks', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-02T10:00:00Z'));

    const userStore = useUserStore();
    userStore.id = 'owner-1';
    userStore.token = 'token-1';
    userStore.timezone = 'Europe/Helsinki';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders existing needs from the store on first load', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet()];
    const getAllPets = vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();

    expect(getAllPets).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.pet-container.pet-panel').exists()).toBe(true);
    expect(wrapper.text()).toContain('Testikissa');
    expect(wrapper.text()).toContain('Medicine');
    expect(wrapper.text()).toContain('Morning drops');
  });

  it('makes the care task area a keyboard-accessible scroll region when tasks exist', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet()];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();
    const careTaskArea = wrapper.get('.care-task-area');

    expect(careTaskArea.attributes('role')).toBe('region');
    expect(careTaskArea.attributes('aria-label')).toBe('Care tasks for selected day');
    expect(careTaskArea.attributes('tabindex')).toBe('0');
  });

  it('keeps the cached pet visible while the background refresh is pending', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet()];
    let resolveRefresh: (value: { isSuccess: boolean }) => void = () => {};
    vi.spyOn(petStore, 'getAllPets').mockImplementation(
      () =>
        new Promise<{ isSuccess: boolean }>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const wrapper = await mountPagePet({ waitForAsync: false });

    expect(wrapper.text()).toContain('Testikissa');
    expect(wrapper.text()).toContain('Medicine');
    expect(wrapper.text()).not.toContain('Fetching your family member');

    resolveRefresh({ isSuccess: true });
    await flushPromises();
  });

  it('fetches pets once when the route pet is missing from the store', async () => {
    const petStore = usePetStore();
    const getAllPets = vi.spyOn(petStore, 'getAllPets').mockImplementation(async () => {
      petStore.pets = [makePet()];
      return { isSuccess: true };
    });

    const wrapper = await mountPagePet();

    expect(getAllPets).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('Medicine');
    expect(wrapper.text()).toContain('Morning drops');
  });

  it('updates the displayed needs when the store changes after mount', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet({ needs: [] })];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();
    expect(wrapper.text()).toContain('All clear for today!');
    expect(wrapper.find('.empty-care-state').exists()).toBe(true);
    expect(wrapper.get('.care-task-area').attributes('tabindex')).toBeUndefined();

    petStore.$patch((state) => {
      const pet = state.pets.find((pet) => pet.id === 'pet-1');
      if (pet) {
        pet.needs = [makeNeed({ category: 'Food', description: 'Dinner bowl' })];
      }
    });
    await nextTick();

    expect(wrapper.text()).toContain('Food');
    expect(wrapper.text()).toContain('Dinner bowl');
  });

  it('uses future-specific empty copy when a future day has no generated tasks', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet({ needs: [] })];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();
    const nextButton = wrapper.findAll('button').find((button) => button.text().includes('Next'));

    expect(nextButton?.exists()).toBe(true);
    await nextButton?.trigger('click');

    expect(wrapper.text()).not.toContain('All clear for today!');
    expect(wrapper.text()).toContain('Care tasks will appear when this day starts');
    expect(wrapper.text()).toContain('Future routines are generated on the day they are due.');
  });
});
