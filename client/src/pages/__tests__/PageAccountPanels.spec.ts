import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PageChangePassword from '@/pages/PageChangePassword.vue';
import PageEditProfile from '@/pages/PageEditProfile.vue';
import { useUserStore } from '@/store/user';

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

describe('PageEditProfile behaviour', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
  });

  const fillAndSubmit = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.get('#editprofile-username').setValue('Angelica');
    await wrapper.get('#editprofile-email').setValue('angelica@example.com');
    await wrapper.get('#editprofile-current-password').setValue('current-code');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
  };

  it('requires the current password before calling the store', async () => {
    const userStore = useUserStore();
    const updateSpy = vi.spyOn(userStore, 'updateUserProfile');

    const wrapper = mount(PageEditProfile);
    await wrapper.get('#editprofile-username').setValue('Angelica');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(updateSpy).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Please enter your current password');
  });

  it('submits the entered values and navigates to profile on success', async () => {
    const userStore = useUserStore();
    // The page passes its reactive editData by reference and then clears
    // currentPassword on success, so capture a snapshot at call time.
    let submitted: Record<string, string> | undefined;
    const updateSpy = vi
      .spyOn(userStore, 'updateUserProfile')
      .mockImplementation(async (payload) => {
        submitted = { ...payload };
        return { isSuccess: true };
      });

    const wrapper = mount(PageEditProfile);
    await fillAndSubmit(wrapper);

    expect(updateSpy).toHaveBeenCalledOnce();
    expect(submitted).toMatchObject({
      userName: 'Angelica',
      email: 'angelica@example.com',
      currentPassword: 'current-code',
    });
    expect(push).toHaveBeenCalledWith({
      name: 'profile',
      query: { userUpdateSuccessfully: 'true' },
    });
  });

  it('surfaces field errors and the message when the update fails', async () => {
    const userStore = useUserStore();
    vi.spyOn(userStore, 'updateUserProfile').mockResolvedValue({
      isSuccess: false,
      message: 'Update failed',
      errorDetails: { email: ['Email is already in use'] },
    });

    const wrapper = mount(PageEditProfile);
    await fillAndSubmit(wrapper);

    expect(push).not.toHaveBeenCalled();
    expect(wrapper.get('#editprofile-email-error').text()).toContain('Email is already in use');
    expect(wrapper.text()).toContain('Update failed');
  });
});

describe('PageChangePassword behaviour', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
  });

  const fillAndSubmit = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.get('#changepw-current-password').setValue('current-code');
    await wrapper.get('#changepw-new-password').setValue('NewPawCode1!');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
  };

  it('submits the passwords and navigates to profile on success', async () => {
    const userStore = useUserStore();
    const changeSpy = vi.spyOn(userStore, 'changePassword').mockResolvedValue({ isSuccess: true });

    const wrapper = mount(PageChangePassword);
    await fillAndSubmit(wrapper);

    expect(changeSpy).toHaveBeenCalledWith({
      currentPassword: 'current-code',
      newPassword: 'NewPawCode1!',
    });
    expect(push).toHaveBeenCalledWith({
      name: 'profile',
      query: { passwordChangedSuccessfully: 'true' },
    });
  });

  it('blocks weak new passwords before calling the store', async () => {
    const userStore = useUserStore();
    const changeSpy = vi.spyOn(userStore, 'changePassword');

    const wrapper = mount(PageChangePassword);
    await wrapper.get('#changepw-current-password').setValue('current-code');
    await wrapper.get('#changepw-new-password').setValue('weak');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(changeSpy).not.toHaveBeenCalled();
    expect(wrapper.get('#changepw-new-error').text()).toContain('requirements');
    expect(wrapper.get('#changepw-new-password').attributes('aria-describedby')).toContain(
      'changepw-new-error',
    );
  });

  it('surfaces field errors and the message when the change fails', async () => {
    const userStore = useUserStore();
    vi.spyOn(userStore, 'changePassword').mockResolvedValue({
      isSuccess: false,
      message: 'Change failed',
      errorDetails: { currentPassword: ['Current paw code is incorrect'] },
    });

    const wrapper = mount(PageChangePassword);
    await fillAndSubmit(wrapper);

    expect(push).not.toHaveBeenCalled();
    expect(wrapper.get('#changepw-current-error').text()).toContain(
      'Current paw code is incorrect',
    );
    expect(wrapper.text()).toContain('Change failed');
  });

  it('reflects password rule validation as the new password is typed', async () => {
    const wrapper = mount(PageChangePassword);

    await wrapper.get('#changepw-new-password').setValue('NewPawCode1!');

    const validItems = wrapper.findAll('#changepw-requirements li.valid');
    expect(validItems).toHaveLength(5);
  });
});
