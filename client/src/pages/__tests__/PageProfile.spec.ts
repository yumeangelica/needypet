import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PageProfile from '@/pages/PageProfile.vue';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';

vi.mock('@/components/TheConfirmDialog.vue', () => ({
  default: {
    name: 'TheConfirmDialog',
    props: ['isOpen', 'title', 'message', 'confirmLabel', 'cancelLabel', 'variant', 'icon'],
    emits: ['confirm', 'cancel'],
    template: '<div class="confirm-dialog-stub" />',
  },
}));
vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));

const push = vi.fn();
const replace = vi.fn();
// Mutable route so individual tests can drive query-param branches.
const route: { name: string; query: Record<string, string> } = { name: 'profile', query: {} };
vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => route,
  useRouter: () => ({ push, replace }),
}));

const loadedUser = {
  id: 'user-1',
  userName: 'Angelica',
  email: 'angelica@example.com',
  emailConfirmed: true,
  timezone: 'Europe/Helsinki',
};

describe('PageProfile layout stability', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
    replace.mockClear();
    route.name = 'profile';
    route.query = {};
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

  it('navigates to edit-profile and change-password from the settings actions', async () => {
    const userStore = useUserStore();
    userStore.id = 'user-1';
    userStore.token = 'token-1';
    vi.spyOn(userStore, 'getUserById').mockResolvedValue(loadedUser);

    const wrapper = mount(PageProfile);
    await flushPromises();
    await wrapper.get('button[aria-label="Settings"]').trigger('click');

    const actions = wrapper.findAll('.profile-action');
    const edit = actions.find((b) => b.text().includes('Edit My Details'));
    const changePw = actions.find((b) => b.text().includes('Change My Paw Code'));
    await edit?.trigger('click');
    await changePw?.trigger('click');

    expect(push).toHaveBeenCalledWith({ name: 'edit-profile' });
    expect(push).toHaveBeenCalledWith({ name: 'change-password' });
  });
});

describe('PageProfile actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
    replace.mockClear();
    route.name = 'profile';
    route.query = {};
  });

  const mountLoaded = async () => {
    const userStore = useUserStore();
    userStore.id = 'user-1';
    userStore.token = 'token-1';
    vi.spyOn(userStore, 'getUserById').mockResolvedValue(loadedUser);
    const wrapper = mount(PageProfile);
    await flushPromises();
    return { wrapper, userStore };
  };

  it('shows a success toast after a profile update redirect', async () => {
    route.query = { userUpdateSuccessfully: 'true' };
    const appStore = useAppStore();
    const notify = vi.spyOn(appStore, 'addNotification');

    await mountLoaded();

    expect(notify).toHaveBeenCalledWith('Your details are all updated! 🐾', 'success');
    expect(replace).toHaveBeenCalledWith({ name: 'profile', query: {} });
  });

  it('shows a success toast after a password change redirect', async () => {
    route.query = { passwordChangedSuccessfully: 'true' };
    const appStore = useAppStore();
    const notify = vi.spyOn(appStore, 'addNotification');

    await mountLoaded();

    expect(notify).toHaveBeenCalledWith('Your new secret paw code is saved! 🐾', 'success');
    expect(replace).toHaveBeenCalledWith({ name: 'profile', query: {} });
  });

  // Returns the confirm dialog that is currently open (isOpen === true).
  const openDialog = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAllComponents({ name: 'TheConfirmDialog' }).find((d) => d.props('isOpen') === true);

  it('logs out, redirects to landing and greets the user by name', async () => {
    const { wrapper, userStore } = await mountLoaded();
    const logoutSpy = vi.spyOn(userStore, 'logout').mockResolvedValue();
    const appStore = useAppStore();
    const notify = vi.spyOn(appStore, 'addNotification');

    await wrapper.get('.profile-logout-button').trigger('click');
    await openDialog(wrapper)?.vm.$emit('confirm');
    await flushPromises();

    expect(logoutSpy).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith({ name: 'landing' });
    expect(notify).toHaveBeenCalledWith('See you next time, Angelica! 👋', 'success');
  });

  it('reports an error toast when account deletion fails', async () => {
    const { wrapper, userStore } = await mountLoaded();
    vi.spyOn(userStore, 'deleteAccount').mockResolvedValue({
      isSuccess: false,
      message: 'Delete failed',
    });
    const appStore = useAppStore();
    const notify = vi.spyOn(appStore, 'addNotification');

    await wrapper.get('button[aria-label="Settings"]').trigger('click');
    await wrapper.get('.profile-danger-button').trigger('click');
    await openDialog(wrapper)?.vm.$emit('confirm');
    await flushPromises();

    expect(notify).toHaveBeenCalledWith('Delete failed', 'error');
  });
});
