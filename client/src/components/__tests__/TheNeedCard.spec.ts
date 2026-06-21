import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Stub UI library components to keep tests focused on TheNeedCard logic.
vi.mock('@/components/ui', () => ({
  AlertDialog: {
    template: '<div class="alert-dialog-stub" />',
    props: ['open', 'title', 'message', 'confirmLabel', 'cancelLabel', 'variant'],
    emits: ['confirm', 'cancel'],
  },
  Dialog: {
    template: '<div class="dialog-stub"><slot /></div>',
    props: ['open', 'title', 'maxWidth'],
    emits: ['update:open'],
  },
  Select: {
    template: '<select />',
    props: ['modelValue', 'options', 'placeholder'],
    emits: ['update:modelValue'],
  },
  Switch: { template: '<button role="switch" />', props: ['checked'], emits: ['update:checked'] },
}));

vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  // biome-ignore lint/suspicious/noExplicitAny: same callable-intersection workaround
  const mock: any = vi.fn();
  const delegate = (...args: unknown[]) => mock(...args);
  mock.post = vi.fn().mockImplementation(delegate);
  mock.put = vi.fn().mockImplementation(delegate);
  mock.patch = vi.fn().mockImplementation(delegate);
  mock.delete = vi.fn().mockImplementation(delegate);
  mock.get = vi.fn().mockImplementation(delegate);
  return { ...actual, apiClient: mock };
});

import TheNeedCard from '@/components/TheNeedCard.vue';
import { apiClient } from '@/services';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';

const mockedApiClient = vi.mocked(apiClient);

const rewireSubMethods = () => {
  // biome-ignore lint/suspicious/noExplicitAny: same callable-intersection workaround
  const delegate = (...args: unknown[]) => (mockedApiClient as any)(...args);
  // biome-ignore lint/suspicious/noExplicitAny: same callable-intersection workaround
  const m = mockedApiClient as any;
  for (const method of ['post', 'put', 'patch', 'delete', 'get']) {
    m[method].mockReset();
    m[method].mockImplementation(delegate);
  }
};

const resetMock = () => {
  mockedApiClient.mockReset();
  rewireSubMethods();
};

const today = () => new Date().toISOString().slice(0, 10);

const makeDurationNeed = (overrides = {}) => ({
  id: 'need-1',
  category: 'Walk',
  description: 'Evening walk',
  dateFor: today(),
  duration: { value: 30, unit: 'minutes' as const },
  completed: false,
  isActive: true,
  careRecords: [],
  ...overrides,
});

const globalProvide = (isOwner = true) => ({
  provide: {
    isOwner,
    handleNeedDeletion: vi.fn(),
  },
});

describe('TheNeedCard — rendering', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();

    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.timezone = 'Europe/Helsinki';
  });

  it('renders the category and description', () => {
    const wrapper = mount(TheNeedCard, {
      props: { need: makeDurationNeed(), petId: 'pet-1' },
      global: globalProvide(),
    });

    expect(wrapper.text()).toContain('Walk');
    expect(wrapper.text()).toContain('Evening walk');
  });

  it('renders duration value and unit', () => {
    const wrapper = mount(TheNeedCard, {
      props: { need: makeDurationNeed(), petId: 'pet-1' },
      global: globalProvide(),
    });

    expect(wrapper.text()).toContain('30');
    expect(wrapper.text()).toContain('minutes');
  });

  it('shows the "Complete" button for an incomplete today need', () => {
    const wrapper = mount(TheNeedCard, {
      props: { need: makeDurationNeed({ completed: false }), petId: 'pet-1' },
      global: globalProvide(),
    });

    expect(wrapper.find('.complete-button').exists()).toBe(true);
  });

  it('shows the "Done" label for a completed need instead of the Complete button', () => {
    const wrapper = mount(TheNeedCard, {
      props: { need: makeDurationNeed({ completed: true }), petId: 'pet-1' },
      global: globalProvide(),
    });

    expect(wrapper.find('.complete-button').exists()).toBe(false);
    expect(wrapper.find('.done-label').exists()).toBe(true);
  });

  it('does not show the Complete button for a future need', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const wrapper = mount(TheNeedCard, {
      props: {
        need: makeDurationNeed({ dateFor: futureDate.toISOString().slice(0, 10) }),
        petId: 'pet-1',
      },
      global: globalProvide(),
    });

    expect(wrapper.find('.complete-button').exists()).toBe(false);
  });

  it('shows the options menu button for owners', () => {
    const wrapper = mount(TheNeedCard, {
      props: { need: makeDurationNeed(), petId: 'pet-1' },
      global: globalProvide(true),
    });

    expect(wrapper.find('button[aria-label="Need options"]').exists()).toBe(true);
  });

  it('does not show the options menu button for non-owners', () => {
    const wrapper = mount(TheNeedCard, {
      props: { need: makeDurationNeed(), petId: 'pet-1' },
      global: globalProvide(false),
    });

    expect(wrapper.find('button[aria-label="Need options"]').exists()).toBe(false);
  });

  it('applies card-inactive class when isActive is false', () => {
    const wrapper = mount(TheNeedCard, {
      props: { need: makeDurationNeed({ isActive: false }), petId: 'pet-1' },
      global: globalProvide(),
    });

    expect(wrapper.find('.need-card').classes()).toContain('card-inactive');
  });
});

describe('TheNeedCard — addRecord (Complete button)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();

    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.timezone = 'Europe/Helsinki';

    const petStore = usePetStore();
    petStore.pets = [
      { id: 'pet-1', needs: [{ id: 'need-1', isActive: true, completed: false }] },
    ] as unknown as typeof petStore.pets;
  });

  it('calls addRecord when the Complete button is clicked', async () => {
    mockedApiClient.mockResolvedValueOnce({ status: 201, data: {} });

    const wrapper = mount(TheNeedCard, {
      props: { need: makeDurationNeed(), petId: 'pet-1' },
      global: globalProvide(),
    });

    await wrapper.find('.complete-button').trigger('click');
    await wrapper.vm.$nextTick();

    expect(mockedApiClient).toHaveBeenCalledTimes(1);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.url).toContain('/newrecord');
  });
});

describe('TheNeedCard — emits', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();

    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.timezone = 'Europe/Helsinki';

    const petStore = usePetStore();
    petStore.pets = [
      { id: 'pet-1', needs: [{ id: 'need-1', isActive: true, completed: false }] },
    ] as unknown as typeof petStore.pets;
  });

  it('shows the delete confirmation dialog when the Delete button is clicked', async () => {
    const wrapper = mount(TheNeedCard, {
      props: { need: makeDurationNeed(), petId: 'pet-1' },
      global: globalProvide(true),
    });

    // Expand options panel first
    await wrapper.find('button[aria-label="Need options"]').trigger('click');

    const deleteBtn = wrapper.find('button[aria-label="Delete need"]');
    expect(deleteBtn.exists()).toBe(true);
    await deleteBtn.trigger('click');

    // AlertDialog stub should now be present
    expect(wrapper.find('.alert-dialog-stub').exists()).toBe(true);
  });
});
