import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PageProfile from '@/pages/PageProfile.vue';
import { useUserStore } from '@/store/user';

vi.mock('@/components/TheConfirmDialog.vue', () => ({
  default: { template: '<div class="confirm-dialog-stub" />' },
}));
vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));

const push = vi.fn();
vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => ({ name: 'profile', query: {} }),
  useRouter: () => ({ push }),
}));

describe('PageProfile layout stability', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
  });

  it('keeps the loading state inside the account panel', () => {
    const wrapper = mount(PageProfile);

    const panel = wrapper.get('.form-container.account-panel');
    expect(panel.text()).toContain('Loading your profile');
  });

  it('keeps the loaded profile inside the same account panel', async () => {
    const userStore = useUserStore();
    userStore.id = 'user-1';
    userStore.token = 'token-1';
    vi.spyOn(userStore, 'getUserById').mockResolvedValue({
      id: 'user-1',
      userName: 'Angelica',
      email: 'angelica@example.com',
      emailConfirmed: true,
      timezone: 'Europe/Helsinki',
    });

    const wrapper = mount(PageProfile);
    await flushPromises();

    const panel = wrapper.get('.form-container.account-panel');
    expect(panel.text()).toContain('Angelica');
    expect(panel.text()).toContain('Europe/Helsinki');
  });

  it('uses the profile action layout and expands settings actions', async () => {
    const userStore = useUserStore();
    userStore.id = 'user-1';
    userStore.token = 'token-1';
    vi.spyOn(userStore, 'getUserById').mockResolvedValue({
      id: 'user-1',
      userName: 'Angelica',
      email: 'angelica@example.com',
      emailConfirmed: true,
      timezone: 'Europe/Helsinki',
    });

    const wrapper = mount(PageProfile);
    await flushPromises();

    expect(wrapper.find('.profile-actions .profile-logout-button').exists()).toBe(true);
    expect(wrapper.find('.profile-danger-button').exists()).toBe(false);

    const settingsButton = wrapper.get('button[aria-label="Settings"]');
    expect(settingsButton.attributes('aria-expanded')).toBe('false');
    await settingsButton.trigger('click');

    expect(settingsButton.attributes('aria-expanded')).toBe('true');
    expect(wrapper.text()).toContain('Edit My Details');
    expect(wrapper.text()).toContain('Change My Paw Code');
    expect(wrapper.find('.profile-danger-button').exists()).toBe(true);
  });
});
