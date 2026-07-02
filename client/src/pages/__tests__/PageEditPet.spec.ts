import { mount } from '@vue/test-utils';
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
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'pet-1' } }),
  useRouter: () => ({ push }),
}));

describe('PageEditPet - pet image', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
  });

  it('submits the selected pet image in the update payload', async () => {
    const userStore = useUserStore();
    userStore.timezone = 'Europe/Helsinki';

    const petStore = usePetStore();
    petStore.pets = [
      {
        id: 'pet-1',
        name: 'Milo',
        species: 'Cat',
        breed: 'Tabby',
        image: { source: 'preset', key: 'cat' },
      },
    ] as unknown as typeof petStore.pets;

    const updatePet = vi.spyOn(petStore, 'updatePet').mockResolvedValue({ isSuccess: true });

    const wrapper = mount(PageEditPet);

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

  it('uses the shared pet panel layout', () => {
    const userStore = useUserStore();
    userStore.timezone = 'Europe/Helsinki';

    const petStore = usePetStore();
    petStore.pets = [
      {
        id: 'pet-1',
        name: 'Milo',
        species: 'Cat',
        breed: 'Tabby',
        image: { source: 'preset', key: 'cat' },
      },
    ] as unknown as typeof petStore.pets;

    const wrapper = mount(PageEditPet);

    expect(wrapper.find('.form-container.pet-form-container.pet-panel').exists()).toBe(true);
  });
});
