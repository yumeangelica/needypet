import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App.vue';

vi.mock('@/components/TheHeader.vue', () => ({ default: { template: '<header />' } }));
vi.mock('@/components/TheMobileHeader.vue', () => ({ default: { template: '<nav />' } }));
vi.mock('@/components/TheNotification.vue', () => ({ default: { template: '<div />' } }));

vi.mock('vue-router', () => ({
  useRoute: () => ({ name: 'landing' }),
}));

describe('App route shell', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders routes directly without a route transition wrapper', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<main class="router-view-stub" />' },
        },
      },
    });

    expect(wrapper.find('.route-shell .router-view-stub').exists()).toBe(true);
    expect(wrapper.find('transition-stub').exists()).toBe(false);
  });
});
