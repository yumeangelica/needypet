import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PageLanding from '@/pages/PageLanding.vue';

vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));
vi.mock('@/components/TheLogoImage.vue', () => ({ default: { template: '<div class="logo" />' } }));

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));

describe('PageLanding layout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
  });

  it('uses the shared auth panel layout', () => {
    const wrapper = mount(PageLanding);

    expect(wrapper.find('.login-register-container.auth-panel.landing-card').exists()).toBe(true);
    expect(wrapper.find('.landing-actions').exists()).toBe(true);
  });
});
