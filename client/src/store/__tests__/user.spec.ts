import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiError } from '@/services';

// Mock the API client used by the user store.
vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  return { ...actual, apiClient: vi.fn() };
});

import { apiClient } from '@/services';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';

const mockedApiClient = vi.mocked(apiClient);

// Build an error shaped like the one the real client throws (Error + response).
const apiError = (status: number, data: Record<string, unknown> = {}): ApiError => {
  const error = new Error(`Request failed with status ${status}`) as ApiError;
  error.response = { status, data };
  return error;
};

describe('user store - resendEmailConfirmation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockedApiClient.mockReset();
  });

  it('returns a success result on a 200 response', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await userStore.resendEmailConfirmation();

    expect(result.isSuccess).toBe(true);
    expect(mockedApiClient).toHaveBeenCalledTimes(1);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.method).toBe('post');
    expect(callArg.url).toBe('/auth/resend-email-confirmation');
  });

  it('fails without notifying and surfaces the backend message on a 535', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    const appStore = useAppStore();
    const notifySpy = vi.spyOn(appStore, 'addNotification');

    // Email server auth failure: the store must not raise its own toast, so the
    // calling page can show a single error instead of two (regression guard).
    mockedApiClient.mockRejectedValueOnce(apiError(535, { message: 'SMTP auth failed' }));

    const result = await userStore.resendEmailConfirmation();

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('SMTP auth failed');
    expect(notifySpy).not.toHaveBeenCalled();
  });

  it('fails without calling the API when there is no token', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const result = await userStore.resendEmailConfirmation();

    expect(result.isSuccess).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });
});
