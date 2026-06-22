import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiError } from '@/services';

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  routeQuery: {
    confirmationType: 'password',
    email: 'test@example.com',
    token: 'reset-token',
  } as Record<string, string>,
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routerMocks.routeQuery }),
  useRouter: () => ({ push: routerMocks.push }),
}));

vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));
vi.mock('@/components/TheLogoImage.vue', () => ({ default: { template: '<div />' } }));

vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  // biome-ignore lint/suspicious/noExplicitAny: same callable-intersection workaround used in store tests
  const mock: any = vi.fn();
  const delegate = (...args: unknown[]) => mock(...args);
  mock.post = vi.fn().mockImplementation(delegate);
  mock.put = vi.fn().mockImplementation(delegate);
  mock.patch = vi.fn().mockImplementation(delegate);
  mock.delete = vi.fn().mockImplementation(delegate);
  mock.get = vi.fn().mockImplementation(delegate);
  return { ...actual, apiClient: mock };
});

import PageConfirm from '@/pages/PageConfirm.vue';
import { apiClient } from '@/services';

const mockedApiClient = vi.mocked(apiClient);

const apiError = (status: number, data: Record<string, unknown> = {}): ApiError => {
  const error = new Error(`Request failed with status ${status}`) as ApiError;
  error.response = { status, data };
  return error;
};

const rewireSubMethods = () => {
  // biome-ignore lint/suspicious/noExplicitAny: same callable-intersection workaround
  const delegate = (...args: unknown[]) => (mockedApiClient as any)(...args);
  // biome-ignore lint/suspicious/noExplicitAny: needed to index sub-methods by string
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

describe('PageConfirm password reset', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
    routerMocks.push.mockClear();
    routerMocks.routeQuery = {
      confirmationType: 'password',
      email: 'test@example.com',
      token: 'reset-token',
    };
  });

  it('uses the backend special-character set for password hints', async () => {
    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const wrapper = mount(PageConfirm);
    await flushPromises();

    const passwordInput = wrapper.find('input[aria-label="New Password"]');

    await passwordInput.setValue('ValidPass1?');
    await passwordInput.trigger('input');
    expect(wrapper.findAll('li.valid')).toHaveLength(4);

    await passwordInput.setValue('ValidPass1!');
    await passwordInput.trigger('input');
    expect(wrapper.findAll('li.valid')).toHaveLength(5);
  });

  it('shows the backend newPassword error when reset validation fails', async () => {
    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} }).mockRejectedValueOnce(
      apiError(422, {
        message: 'Password strength validation error',
        errorDetails: {
          newPassword: ['Password does not meet the strength requirements.'],
        },
      }),
    );

    const wrapper = mount(PageConfirm);
    await flushPromises();

    await wrapper.find('input[aria-label="New Password"]').setValue('ValidPass1!');
    await wrapper.find('input[aria-label="New Password"]').trigger('input');
    await wrapper.find('input[aria-label="Confirm Password"]').setValue('ValidPass1!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('#confirm-reset-error').text()).toContain(
      'Password does not meet the strength requirements.',
    );
  });
});
