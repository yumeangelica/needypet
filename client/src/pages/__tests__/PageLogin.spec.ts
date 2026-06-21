import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Stub sub-components that pull in heavy dependencies (router-links, icons, etc.)
vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));
vi.mock('@/components/TheLogoImage.vue', () => ({ default: { template: '<div />' } }));

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

import PageLogin from '@/pages/PageLogin.vue';
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

describe('PageLogin', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
    push.mockClear();
  });

  it('renders the login form with username and password inputs', () => {
    const wrapper = mount(PageLogin);

    const usernameInput = wrapper.find('input[aria-label="Username"]');
    const passwordInput = wrapper.find('input[aria-label="Password"]');
    const submitButton = wrapper.find('button[type="submit"]');

    expect(usernameInput.exists()).toBe(true);
    expect(passwordInput.exists()).toBe(true);
    expect(submitButton.exists()).toBe(true);
    expect(submitButton.text()).toContain('Log In');
  });

  it('navigates home and fetches pets on successful login', async () => {
    // Login response
    mockedApiClient.mockResolvedValueOnce({
      status: 200,
      data: {
        token: 'tok-abc',
        user: {
          userName: 'testUser',
          id: 'uid-1',
          timezone: 'Europe/Helsinki',
          emailConfirmed: true,
        },
      },
    });
    // getAllPets response after login
    mockedApiClient.mockResolvedValueOnce({ status: 200, data: [] });

    const wrapper = mount(PageLogin);

    await wrapper.find('input[aria-label="Username"]').setValue('testUser');
    await wrapper.find('input[aria-label="Password"]').setValue('Pass123!');
    await wrapper.find('form').trigger('submit.prevent');

    // Wait for login async chain to complete
    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(push).toHaveBeenCalledWith({ name: 'home' });
  });

  it('shows an error notification on failed login', async () => {
    mockedApiClient.mockRejectedValueOnce(
      (() => {
        const err = new Error('401') as Error & {
          response?: { status: number; data: Record<string, unknown> };
        };
        err.response = { status: 401, data: { message: 'Invalid credentials' } };
        return err;
      })(),
    );

    const wrapper = mount(PageLogin);

    await wrapper.find('input[aria-label="Username"]').setValue('badUser');
    await wrapper.find('input[aria-label="Password"]').setValue('wrong');
    await wrapper.find('form').trigger('submit.prevent');

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(push).not.toHaveBeenCalledWith({ name: 'home' });
  });

  it('navigates back to landing on the Back button', async () => {
    const wrapper = mount(PageLogin);

    // Find by text content since there are multiple type="button" buttons
    const buttons = wrapper.findAll('button[type="button"]');
    const backBtn = buttons.find((b) => b.text().includes('Back'));
    expect(backBtn?.exists()).toBe(true);
    await backBtn?.trigger('click');

    expect(push).toHaveBeenCalledWith({ name: 'landing' });
  });

  it('toggles password field type when the show/hide button is clicked', async () => {
    const wrapper = mount(PageLogin);

    const passwordInput = wrapper.find('input[aria-label="Password"]');
    expect(passwordInput.attributes('type')).toBe('password');

    const toggleBtn = wrapper.find('button[aria-label="Show password"]');
    await toggleBtn.trigger('click');

    expect(wrapper.find('input[aria-label="Password"]').attributes('type')).toBe('text');
  });
});
