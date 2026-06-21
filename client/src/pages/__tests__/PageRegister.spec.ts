import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));
vi.mock('@/components/TheLogoImage.vue', () => ({ default: { template: '<div />' } }));
vi.mock('@/components/TheTimezoneSelectorModal.vue', () => ({
  default: { template: '<div />', props: ['isOpen'], emits: ['update:isOpen', 'timezoneSelected'] },
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

import PageRegister from '@/pages/PageRegister.vue';
import { apiClient } from '@/services';

const mockedApiClient = vi.mocked(apiClient);

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));

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

describe('PageRegister', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
    push.mockClear();
  });

  it('renders all registration form fields', () => {
    const wrapper = mount(PageRegister);

    expect(wrapper.find('input[aria-label="Username"]').exists()).toBe(true);
    expect(wrapper.find('input[aria-label="Email"]').exists()).toBe(true);
    expect(wrapper.find('input[aria-label="Password"]').exists()).toBe(true);
    expect(wrapper.find('input[aria-label="Confirm Password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toContain('Create Account');
  });

  it('shows password validation hints that update as the user types', async () => {
    const wrapper = mount(PageRegister);

    const passwordInput = wrapper.find('input[aria-label="Password"]');
    await passwordInput.setValue('ValidPass1!');

    const validItems = wrapper.findAll('li.valid');
    expect(validItems.length).toBeGreaterThan(0);
  });

  it('shows a field error when passwords do not match', async () => {
    const wrapper = mount(PageRegister);

    // Fill in a valid password first so validations pass
    const passwordInput = wrapper.find('input[aria-label="Password"]');
    await passwordInput.setValue('ValidPass1!');
    // Trigger the validatePassword handler
    await passwordInput.trigger('input');

    const confirmInput = wrapper.find('input[aria-label="Confirm Password"]');
    await confirmInput.setValue('DifferentPass1!');

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    // The password-mismatch error should be rendered
    const errorEl = wrapper.find('#reg-password-error');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toContain('Passwords do not match');
  });

  it('shows a field error when the password does not meet requirements', async () => {
    const wrapper = mount(PageRegister);

    // Submit without meeting password requirements
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    const errorEl = wrapper.find('#reg-password-error');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toContain('requirements');
  });

  it('calls createAccount and navigates to login on success', async () => {
    mockedApiClient.mockResolvedValueOnce({ status: 201, data: {} });

    const wrapper = mount(PageRegister);

    // Set timezone directly via component state
    await (wrapper.vm as unknown as { selectedTimezone: { value: string } }).selectedTimezone;

    // Fill the form
    await wrapper.find('input[aria-label="Username"]').setValue('newUser');
    await wrapper.find('input[aria-label="Email"]').setValue('new@example.com');
    const passwordInput = wrapper.find('input[aria-label="Password"]');
    await passwordInput.setValue('ValidPass1!');
    await passwordInput.trigger('input');
    await wrapper.find('input[aria-label="Confirm Password"]').setValue('ValidPass1!');

    // Simulate timezone selection via component internal state
    // (the modal is stubbed, so we set it directly)
    // biome-ignore lint/suspicious/noExplicitAny: accessing component internals for test setup
    (wrapper.vm as any).selectedTimezone = 'Europe/Helsinki';

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(push).toHaveBeenCalledWith({ name: 'login', replace: true });
  });

  it('renders per-field errors from the API response', async () => {
    const err = new Error('422') as Error & {
      response?: { status: number; data: Record<string, unknown> };
    };
    err.response = {
      status: 422,
      data: {
        message: 'Validation error',
        errorDetails: {
          userName: ['Username too short'],
          email: ['Invalid email'],
        },
      },
    };
    mockedApiClient.mockRejectedValueOnce(err);

    const wrapper = mount(PageRegister);

    // Fill valid password so strength check passes
    const passwordInput = wrapper.find('input[aria-label="Password"]');
    await passwordInput.setValue('ValidPass1!');
    await passwordInput.trigger('input');
    await wrapper.find('input[aria-label="Confirm Password"]').setValue('ValidPass1!');
    // biome-ignore lint/suspicious/noExplicitAny: component internals
    (wrapper.vm as any).selectedTimezone = 'Europe/Helsinki';

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('#reg-username-error').exists()).toBe(true);
    expect(wrapper.find('#reg-username-error').text()).toContain('Username too short');

    // The invalid input is programmatically linked to its error message.
    const usernameInput = wrapper.find('input[aria-label="Username"]');
    expect(usernameInput.attributes('aria-invalid')).toBe('true');
    expect(usernameInput.attributes('aria-describedby')).toBe('reg-username-error');
  });

  it('navigates back to landing on the Back button', async () => {
    const wrapper = mount(PageRegister);

    // Find the Back button (secondary button)
    const buttons = wrapper.findAll('button[type="button"]');
    const backBtn = buttons.find((b) => b.text().includes('Back'));
    await backBtn?.trigger('click');

    expect(push).toHaveBeenCalledWith({ name: 'landing' });
  });
});
