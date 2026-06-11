import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/services';
import { useUserStore } from './user';

vi.mock('@/services', () => {
  const apiClient = Object.assign(vi.fn(), {
    put: vi.fn(),
  });

  return {
    apiClient,
    isApiError: (error: unknown) => error instanceof Error && 'response' in error,
  };
});

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.mocked(apiClient).mockReset();
  });

  it('stores auth data after successful login', async () => {
    vi.mocked(apiClient).mockResolvedValue({
      status: 200,
      data: {
        token: 'test-token',
        message: 'Welcome back',
        user: {
          id: 'user-1',
          userName: 'angelica',
          timezone: 'Europe/Helsinki',
          emailConfirmed: true,
        },
      },
    });

    const userStore = useUserStore();
    const result = await userStore.login('angelica', 'password');

    expect(result).toEqual({
      isSuccess: true,
      message: 'Welcome back',
    });
    expect(userStore.token).toBe('test-token');
    expect(userStore.userName).toBe('angelica');
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('returns a validation message when login fails with 422', async () => {
    const error = new Error('Request failed');
    Object.assign(error, {
      response: {
        status: 422,
        data: {
          message: 'Validation error',
        },
      },
    });
    vi.mocked(apiClient).mockRejectedValue(error);

    const userStore = useUserStore();
    const result = await userStore.login('angelica', '');

    expect(result).toEqual({
      isSuccess: false,
      message: 'Validation error',
    });
    expect(userStore.token).toBeNull();
  });
});
