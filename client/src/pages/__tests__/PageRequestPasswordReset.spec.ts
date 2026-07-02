import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PageRequestPasswordReset from '@/pages/PageRequestPasswordReset.vue';

vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));
vi.mock('@/components/TheLogoImage.vue', () => ({ default: { template: '<div />' } }));

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));

describe('PageRequestPasswordReset layout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
  });

  it('uses the shared auth card and compact action stack', () => {
    const wrapper = mount(PageRequestPasswordReset);

    expect(
      wrapper.find('.login-register-container.auth-panel.auth-card.auth-form-card').exists(),
    ).toBe(true);
    expect(wrapper.find('.auth-form').exists()).toBe(true);
    expect(wrapper.find('.auth-action-stack').exists()).toBe(true);
  });
});
