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
vi.mock('@/components/ui', () => ({
  Dialog: {
    template: '<div v-if="open" class="dialog-stub"><slot /></div>',
    props: ['open', 'title', 'maxWidth'],
    emits: ['update:open'],
  },
  RadioGroup: { template: '<div><slot /></div>', props: ['modelValue'] },
  RadioGroupItem: { template: '<button type="button">{{ label }}</button>', props: ['label'] },
  Select: { template: '<select />', props: ['modelValue', 'options', 'placeholder'] },
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
    routes: [
      {
        path: '/pets/:id',
        name: 'pet',
        component: PagePet,
        children: [{ path: 'edit', name: 'edit-pet', component: { template: '<div />' } }],
      },
    ],
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

  it('blocks care tasks with a too-short category before calling the store', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet()];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });
    const addNewNeed = vi.spyOn(petStore, 'addNewNeed').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();
    await wrapper.get('button[aria-label="Add care task"]').trigger('click');
    await nextTick();

    await wrapper.get('#need-category').setValue('ab');
    await wrapper.get('#need-description').setValue('Morning drops');
    // biome-ignore lint/suspicious/noExplicitAny: driving exposed setup state in a form-focused test
    (wrapper.vm as any).selection = 'duration';
    await nextTick();
    await wrapper.get('#need-duration-value').setValue('10');
    await wrapper.get('form.care-task-form').trigger('submit');
    await nextTick();

    expect(addNewNeed).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Category must be at least 3 characters');
  });

  it('blocks care tasks with duration outside the server range', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet()];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });
    const addNewNeed = vi.spyOn(petStore, 'addNewNeed').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();
    await wrapper.get('button[aria-label="Add care task"]').trigger('click');
    await nextTick();

    await wrapper.get('#need-category').setValue('Medicine');
    await wrapper.get('#need-description').setValue('Morning drops');
    // biome-ignore lint/suspicious/noExplicitAny: driving exposed setup state in a form-focused test
    (wrapper.vm as any).selection = 'duration';
    await nextTick();

    await wrapper.get('#need-duration-value').setValue('0');
    await wrapper.get('form.care-task-form').trigger('submit');
    await nextTick();

    expect(addNewNeed).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Duration must be at least 1 minute');

    await wrapper.get('#need-duration-value').setValue('1441');
    await wrapper.get('form.care-task-form').trigger('submit');
    await nextTick();

    expect(addNewNeed).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Duration cannot be over 1440 minutes');
  });

  it('blocks care tasks with quantity below the server minimum', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet()];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });
    const addNewNeed = vi.spyOn(petStore, 'addNewNeed').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();
    await wrapper.get('button[aria-label="Add care task"]').trigger('click');
    await nextTick();

    await wrapper.get('#need-category').setValue('Food');
    await wrapper.get('#need-description').setValue('Dinner bowl');
    // biome-ignore lint/suspicious/noExplicitAny: driving exposed setup state in a form-focused test
    (wrapper.vm as any).selection = 'quantity';
    // biome-ignore lint/suspicious/noExplicitAny: driving exposed setup state in a form-focused test
    (wrapper.vm as any).unitOfSelection = 'g';
    await nextTick();
    await wrapper.get('#need-quantity-value').setValue('0');
    await wrapper.get('form.care-task-form').trigger('submit');
    await nextTick();

    expect(addNewNeed).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Quantity must be at least 1');
  });

  it('advances today and refetches when the owner-local midnight passes', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet()];
    const getAllPets = vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });

    // 30 seconds before midnight in the owner's timezone (Helsinki, UTC+3).
    vi.setSystemTime(new Date('2026-07-02T20:59:30Z'));
    const wrapper = await mountPagePet();

    expect(wrapper.get('.date-navigation h4').text()).toBe('2026-07-02');
    expect(getAllPets).toHaveBeenCalledTimes(1);

    // The next minute tick crosses midnight.
    vi.advanceTimersByTime(60000);
    await flushPromises();

    expect(wrapper.get('.date-navigation h4').text()).toBe('2026-07-03');
    expect(wrapper.text()).toContain('All clear for today!');
    expect(getAllPets).toHaveBeenCalledTimes(2);

    // Later ticks within the same day must not refetch again.
    vi.advanceTimersByTime(60000);
    await flushPromises();
    expect(getAllPets).toHaveBeenCalledTimes(2);
  });
});

describe('PagePet - owner vs carer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-02T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the edit and add-task controls to the owner and lists caretakers', async () => {
    const userStore = useUserStore();
    userStore.id = 'owner-1';
    userStore.token = 'token-1';
    userStore.timezone = 'Europe/Helsinki';

    const petStore = usePetStore();
    petStore.pets = [
      makePet({
        careTakers: [
          { id: 'carer-1', userName: 'Helper', timezone: 'Europe/Helsinki', emailConfirmed: true },
        ],
      }),
    ];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();

    expect(wrapper.find('button[aria-label="Edit pet"]').exists()).toBe(true);
    expect(wrapper.find('button[aria-label="Add care task"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Care takers:');
    expect(wrapper.text()).toContain('Helper');
  });

  it('hides the edit and add-task controls from a caretaker', async () => {
    const userStore = useUserStore();
    userStore.id = 'carer-1';
    userStore.token = 'token-1';
    userStore.timezone = 'Europe/Helsinki';

    const petStore = usePetStore();
    petStore.pets = [
      makePet({
        careTakers: [
          { id: 'carer-1', userName: 'Helper', timezone: 'Europe/Helsinki', emailConfirmed: true },
        ],
      }),
    ];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();

    expect(wrapper.text()).toContain('Testikissa');
    expect(wrapper.find('button[aria-label="Edit pet"]').exists()).toBe(false);
    expect(wrapper.find('button[aria-label="Add care task"]').exists()).toBe(false);
  });

  it('navigates to the edit route when the owner clicks the edit button', async () => {
    const userStore = useUserStore();
    userStore.id = 'owner-1';
    userStore.token = 'token-1';
    userStore.timezone = 'Europe/Helsinki';

    const petStore = usePetStore();
    petStore.pets = [makePet()];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();
    await wrapper.get('button[aria-label="Edit pet"]').trigger('click');
    await flushPromises();

    expect(wrapper.vm.$route.name).toBe('edit-pet');
  });

  it('clears the pet and shows nothing when the fetched pet is missing', async () => {
    const userStore = useUserStore();
    userStore.id = 'owner-1';
    userStore.token = 'token-1';
    userStore.timezone = 'Europe/Helsinki';

    const petStore = usePetStore();
    // Store never contains pet-1, and the fetch does not add it.
    petStore.pets = [];
    vi.spyOn(petStore, 'getAllPets').mockResolvedValue({ isSuccess: true });

    const wrapper = await mountPagePet();

    expect(wrapper.find('.pet-container.pet-panel').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Fetching your family member');
  });
});
