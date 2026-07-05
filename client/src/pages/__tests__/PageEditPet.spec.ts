import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import ThePetImagePicker from '@/components/ThePetImagePicker.vue';
import PageEditPet from '@/pages/PageEditPet.vue';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';

vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));
vi.mock('@/components/TheConfirmDialog.vue', () => ({
  default: {
    props: ['isOpen'],
    emits: ['confirm', 'cancel'],
    template:
      '<button v-if="isOpen" class="confirm-update" type="button" @click="$emit(\'confirm\')">confirm</button>',
  },
}));

const push = vi.fn();
const replace = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'pet-1' } }),
  useRouter: () => ({ push, replace }),
}));

const birthdayInput = (wrapper: ReturnType<typeof mount>) => wrapper.find('input#editpet-birthday');

const makePet = (overrides = {}) => ({
  id: 'pet-1',
  name: 'Milo',
  species: 'Cat',
  breed: 'Tabby',
  image: { source: 'preset', key: 'cat' },
  owner: {
    id: 'owner-1',
    userName: 'Angelica',
    timezone: 'Europe/Helsinki',
    emailConfirmed: true,
  },
  ...overrides,
});

describe('PageEditPet - pet image', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
    replace.mockClear();

    const userStore = useUserStore();
    userStore.id = 'owner-1';
    userStore.token = 'token-1';
    userStore.timezone = 'Europe/Helsinki';
  });

  it('submits the selected pet image in the update payload', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet()] as unknown as typeof petStore.pets;

    const updatePet = vi.spyOn(petStore, 'updatePet').mockResolvedValue({ isSuccess: true });

    const wrapper = mount(PageEditPet);
    await flushPromises();
    await nextTick();

    wrapper
      .getComponent(ThePetImagePicker)
      .vm.$emit('update:modelValue', { source: 'preset', key: 'bunny' });
    await nextTick();
    await wrapper.get('form').trigger('submit');
    await wrapper.get('button.confirm-update').trigger('click');

    expect(updatePet).toHaveBeenCalledWith(
      'pet-1',
      expect.objectContaining({
        image: { source: 'preset', key: 'bunny' },
      }),
    );
  });

  it('submits birthday as a date-only string in the update payload', async () => {
    const petStore = usePetStore();
    petStore.pets = [makePet({ birthday: '2024-01-01' })] as unknown as typeof petStore.pets;

    const updatePet = vi.spyOn(petStore, 'updatePet').mockResolvedValue({ isSuccess: true });

    const wrapper = mount(PageEditPet);
    await flushPromises();
    await nextTick();

    await birthdayInput(wrapper).setValue('2024-02-03');
    await birthdayInput(wrapper).trigger('change');
    await wrapper.get('form').trigger('submit');
    await wrapper.get('button.confirm-update').trigger('click');

    expect(updatePet).toHaveBeenCalledWith(
      'pet-1',
      expect.objectContaining({
        birthday: '2024-02-03',
      }),
    );
  });

  it('uses the shared pet panel layout', () => {
    const petStore = usePetStore();
    petStore.pets = [makePet()] as unknown as typeof petStore.pets;

    const wrapper = mount(PageEditPet);

    expect(wrapper.find('.form-container.pet-form-container.pet-panel').exists()).toBe(true);
  });

  it('fetches pets before showing the edit form when the direct route has no cached pet', async () => {
    const petStore = usePetStore();
    const getAllPets = vi.spyOn(petStore, 'getAllPets').mockImplementation(async () => {
      petStore.pets = [makePet({ name: 'Fetched Milo' })] as unknown as typeof petStore.pets;
      return { isSuccess: true };
    });

    const wrapper = mount(PageEditPet);
    await flushPromises();
    await nextTick();

    expect(getAllPets).toHaveBeenCalledTimes(1);
    expect((wrapper.get('#editpet-name').element as HTMLInputElement).value).toBe('Fetched Milo');
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects caretakers away from the direct edit route', async () => {
    const userStore = useUserStore();
    userStore.id = 'carer-1';

    const petStore = usePetStore();
    petStore.pets = [
      makePet({
        careTakers: [
          { id: 'carer-1', userName: 'Helper', timezone: 'Europe/Helsinki', emailConfirmed: true },
        ],
      }),
    ] as unknown as typeof petStore.pets;

    const wrapper = mount(PageEditPet);
    await flushPromises();
    await nextTick();

    expect(replace).toHaveBeenCalledWith({ name: 'pet', params: { id: 'pet-1' } });
    expect(wrapper.find('form').exists()).toBe(false);
  });
});
