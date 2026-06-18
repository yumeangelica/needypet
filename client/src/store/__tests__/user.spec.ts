import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

// Mock the API client used by the user store.
vi.mock('@/services', () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from '@/services';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';

const mockedApiClient = vi.mocked(apiClient);

describe('user store - resendEmailConfirmation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockedApiClient.mockReset();
  });

  it('returns true on a 200 response', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await userStore.resendEmailConfirmation();

    expect(result).toBe(true);
    expect(mockedApiClient).toHaveBeenCalledTimes(1);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.method).toBe('post');
    expect(callArg.url).toBe('/auth/resend-email-confirmation');
  });

  it('returns false without notifying when the request fails', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    const appStore = useAppStore();
    const notifySpy = vi.spyOn(appStore, 'addNotification');

    // Email server auth failure: the store must not raise its own toast, so the
    // calling page can show a single error instead of two (regression guard).
    mockedApiClient.mockRejectedValueOnce({ response: { status: 535 } });

    const result = await userStore.resendEmailConfirmation();

    expect(result).toBe(false);
    expect(notifySpy).not.toHaveBeenCalled();
  });

  it('returns false without calling the API when there is no token', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const result = await userStore.resendEmailConfirmation();

    expect(result).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });
});
