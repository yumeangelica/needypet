import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PageChangePassword from '@/pages/PageChangePassword.vue';
import PageEditProfile from '@/pages/PageEditProfile.vue';

vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));
vi.mock('@/components/TheTimezoneSelectorModal.vue', () => ({
  default: { template: '<div />', props: ['isOpen'], emits: ['update:isOpen', 'timezoneSelected'] },
}));

const push = vi.fn();
vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRouter: () => ({ push }),
}));

describe('account page panels', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
  });

  it('uses the shared account panel layout on edit profile', () => {
    const wrapper = mount(PageEditProfile);

    expect(wrapper.find('.form-container.account-panel').exists()).toBe(true);
  });

  it('uses the shared account panel layout on change password', () => {
    const wrapper = mount(PageChangePassword);

    expect(wrapper.find('.form-container.account-panel').exists()).toBe(true);
  });
});
