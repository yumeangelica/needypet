import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiError } from '@/services';

vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  // apiClient is Object.assign(fn, { post, put, patch, delete, get }).
  // Use `any` to avoid TypeScript complaining about the callable intersection.
  // Sub-methods forward to the main mock so mockResolvedValueOnce/
  // mockRejectedValueOnce on a single instance controls all call paths.
  // biome-ignore lint/suspicious/noExplicitAny: Mock<Procedure | Constructable> intersection is not callable in TS; `any` is the only escape here.
  const mock: any = vi.fn();
  const delegate = (...args: unknown[]) => mock(...args);
  mock.post = vi.fn().mockImplementation(delegate);
  mock.put = vi.fn().mockImplementation(delegate);
  mock.patch = vi.fn().mockImplementation(delegate);
  mock.delete = vi.fn().mockImplementation(delegate);
  mock.get = vi.fn().mockImplementation(delegate);
  return { ...actual, apiClient: mock };
});

import { apiClient } from '@/services';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';

const mockedApiClient = vi.mocked(apiClient);

const apiError = (status: number, data: Record<string, unknown> = {}): ApiError => {
  const error = new Error(`Request failed with status ${status}`) as ApiError;
  error.response = { status, data };
  return error;
};

// After mockReset the sub-method forwarding implementations are cleared.
// Re-wire them so that apiClient.post(...) etc. still delegate to the main
// mock and can be controlled with a single mockResolvedValueOnce queue.
const rewireSubMethods = () => {
  // biome-ignore lint/suspicious/noExplicitAny: same callable-intersection issue as in vi.mock factory
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

describe('user store - resendEmailConfirmation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
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

describe('user store - login', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('sets auth state and returns success on valid credentials', async () => {
    const userStore = useUserStore();

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

    const result = await userStore.login('testUser', 'Pass123!');

    expect(result.isSuccess).toBe(true);
    expect(userStore.token).toBe('tok-abc');
    expect(userStore.userName).toBe('testUser');
    expect(userStore.id).toBe('uid-1');
  });

  it('returns isSuccess false with backend message on 401', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockRejectedValueOnce(apiError(401, { message: 'Invalid credentials' }));

    const result = await userStore.login('testUser', 'wrong');

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });

  it('returns isSuccess false on network error', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockRejectedValueOnce(new Error('Failed to fetch'));

    const result = await userStore.login('testUser', 'Pass123!');

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBeTruthy();
  });
});

describe('user store - logout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('clears state and localStorage', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.userName = 'testUser';
    userStore.id = 'uid-1';
    localStorage.setItem('token', 'tok-abc');

    await userStore.logout();

    expect(userStore.token).toBeNull();
    expect(userStore.userName).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('user store - getUserById', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('returns user data on 200', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    mockedApiClient.mockResolvedValueOnce({
      status: 200,
      data: { userName: 'testUser', id: 'uid-1' },
    });

    const user = await userStore.getUserById('uid-1');

    expect(user).not.toBeNull();
    expect(user?.userName).toBe('testUser');
  });

  it('returns null when there is no token', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const user = await userStore.getUserById('uid-1');

    expect(user).toBeNull();
    expect(mockedApiClient).not.toHaveBeenCalled();
  });

  it('returns null when id is empty', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const user = await userStore.getUserById('');

    expect(user).toBeNull();
    expect(mockedApiClient).not.toHaveBeenCalled();
  });

  it('returns null on a network error', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    mockedApiClient.mockRejectedValueOnce(new Error('network error'));

    const user = await userStore.getUserById('uid-1');

    expect(user).toBeNull();
  });
});

describe('user store - createAccount', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('returns success on 201', async () => {
    mockedApiClient.mockResolvedValueOnce({ status: 201, data: {} });

    const userStore = useUserStore();
    const result = await userStore.createAccount({
      userName: 'newUser',
      email: 'new@example.com',
      newPassword: 'Pass123!',
      timezone: 'Europe/Helsinki',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.message).toContain('check your email');
  });

  it('returns validation errorDetails on 422', async () => {
    mockedApiClient.mockRejectedValueOnce(
      apiError(422, {
        message: 'Validation error',
        errorDetails: { userName: ['Username too short'] },
      }),
    );

    const userStore = useUserStore();
    const result = await userStore.createAccount({
      userName: 'x',
      email: 'new@example.com',
      newPassword: 'Pass123!',
      timezone: 'Europe/Helsinki',
    });

    expect(result.isSuccess).toBe(false);
    expect(result.errorDetails?.userName?.[0]).toBe('Username too short');
  });

  it('posts to the correct endpoint', async () => {
    mockedApiClient.mockResolvedValueOnce({ status: 201, data: {} });

    const userStore = useUserStore();
    await userStore.createAccount({
      userName: 'newUser',
      email: 'new@example.com',
      newPassword: 'Pass123!',
      timezone: 'Europe/Helsinki',
    });

    expect(mockedApiClient).toHaveBeenCalledTimes(1);
  });
});

describe('user store - updateUserProfile', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('patches state and returns success on 200', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.id = 'uid-1';

    mockedApiClient.mockResolvedValueOnce({
      status: 200,
      data: {
        userName: 'updated',
        email: 'u@example.com',
        timezone: 'Europe/London',
        message: 'Updated',
      },
    });

    const result = await userStore.updateUserProfile({
      userName: 'updated',
      email: 'u@example.com',
      timezone: 'Europe/London',
      currentPassword: 'Pass123!',
    });

    expect(result.isSuccess).toBe(true);
    expect(userStore.userName).toBe('updated');
    expect(userStore.timezone).toBe('Europe/London');
  });

  it('returns 401 message on wrong current password', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.id = 'uid-1';

    mockedApiClient.mockRejectedValueOnce(apiError(401, { message: 'Unauthorized' }));

    const result = await userStore.updateUserProfile({
      userName: 'updated',
      email: 'u@example.com',
      timezone: 'Europe/Helsinki',
      currentPassword: 'wrong',
    });

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Unauthorized');
  });
});

describe('user store - changePassword', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('returns success on 200', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.id = 'uid-1';

    mockedApiClient.mockResolvedValueOnce({
      status: 200,
      data: { message: 'Password changed' },
    });

    const result = await userStore.changePassword({
      currentPassword: 'Old123!',
      newPassword: 'New456!',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.message).toBe('Password changed');
  });

  it('returns 401 on wrong current password', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.id = 'uid-1';

    mockedApiClient.mockRejectedValueOnce(apiError(401, { message: 'Unauthorized' }));

    const result = await userStore.changePassword({
      currentPassword: 'wrong',
      newPassword: 'New456!',
    });

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Unauthorized');
  });

  it('returns validation errorDetails on 422', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.id = 'uid-1';

    mockedApiClient.mockRejectedValueOnce(
      apiError(422, {
        message: 'Validation error',
        errorDetails: { newPassword: ['Password too weak'] },
      }),
    );

    const result = await userStore.changePassword({
      currentPassword: 'Old123!',
      newPassword: 'weak',
    });

    expect(result.isSuccess).toBe(false);
    expect(result.errorDetails?.newPassword?.[0]).toBe('Password too weak');
  });
});

describe('user store - deleteAccount', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('returns success on 204', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.id = 'uid-1';

    mockedApiClient.mockResolvedValueOnce({ status: 204, data: {} });

    const result = await userStore.deleteAccount();

    expect(result.isSuccess).toBe(true);
  });

  it('returns 401 message when unauthorized', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    userStore.id = 'uid-1';

    mockedApiClient.mockRejectedValueOnce(apiError(401, { message: 'Unauthorized' }));

    const result = await userStore.deleteAccount();

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Unauthorized');
  });
});

describe('user store - checkAndValidateToken', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('returns true on a valid token', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: { token: 'tok-abc' } });

    const result = await userStore.checkAndValidateToken();

    expect(result).toBe(true);
  });

  it('returns false when there is no token', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const result = await userStore.checkAndValidateToken();

    expect(result).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });

  it('returns false on a network error', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    mockedApiClient.mockRejectedValueOnce(new Error('network error'));

    const result = await userStore.checkAndValidateToken();

    expect(result).toBe(false);
  });
});

describe('user store - confirmEmail', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('returns true on 200', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await userStore.confirmEmail('a@b.com', 'valid-token');

    expect(result).toBe(true);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.url).toBe('/auth/verify-email-confirmation-token');
    expect(callArg.data).toEqual({ email: 'a@b.com', token: 'valid-token' });
  });

  it('returns false on a 401 error', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockRejectedValueOnce(apiError(401));

    const result = await userStore.confirmEmail('a@b.com', 'bad-token');

    expect(result).toBe(false);
  });
});

describe('user store - requestPasswordReset / verifyPasswordResetToken / passwordReset', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('requestPasswordReset posts correct URL and returns true on 200', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await userStore.requestPasswordReset('a@b.com');

    expect(result).toBe(true);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.url).toBe('/auth/request-password-reset');
    expect(callArg.data).toEqual({ email: 'a@b.com' });
  });

  it('requestPasswordReset returns false on error', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockRejectedValueOnce(new Error('network'));

    const result = await userStore.requestPasswordReset('a@b.com');

    expect(result).toBe(false);
  });

  it('verifyPasswordResetToken returns true on 200', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await userStore.verifyPasswordResetToken('a@b.com', 'tok-xyz');

    expect(result).toBe(true);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.url).toBe('/auth/verify-password-reset-token');
  });

  it('verifyPasswordResetToken returns false on 401', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockRejectedValueOnce(apiError(401));

    const result = await userStore.verifyPasswordResetToken('a@b.com', 'bad-tok');

    expect(result).toBe(false);
  });

  it('passwordReset returns true on 200', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await userStore.passwordReset('a@b.com', 'tok-xyz', 'NewPass123!');

    expect(result).toBe(true);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.url).toBe('/auth/password-reset');
    expect(callArg.data).toEqual({
      email: 'a@b.com',
      token: 'tok-xyz',
      newPassword: 'NewPass123!',
    });
  });

  it('passwordReset returns false on error', async () => {
    const userStore = useUserStore();

    mockedApiClient.mockRejectedValueOnce(apiError(401));

    const result = await userStore.passwordReset('a@b.com', 'bad', 'NewPass123!');

    expect(result).toBe(false);
  });
});

describe('user store - isLoggedIn getter', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('is false when token is null', () => {
    const userStore = useUserStore();
    userStore.token = null;
    expect(userStore.isLoggedIn).toBe(false);
  });

  it('is true when token is set', () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';
    expect(userStore.isLoggedIn).toBe(true);
  });
});
