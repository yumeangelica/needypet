import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './index';

const jsonResponse = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: () => 'application/json' },
  json: async () => body,
});

const getRequestInit = (): RequestInit => vi.mocked(fetch).mock.calls[0][1] as RequestInit;

const getHeaders = (): Record<string, string> => getRequestInit().headers as Record<string, string>;

describe('apiClient request wrapper', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, {})));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sets Content-Type: application/json for requests with a body', async () => {
    await apiClient.post('/auth/users', { userName: 'angelica' });

    expect(getHeaders()['Content-Type']).toBe('application/json');
    expect(getRequestInit().body).toBe(JSON.stringify({ userName: 'angelica' }));
  });

  it('does not overwrite a Content-Type set by the caller', async () => {
    await apiClient.post(
      '/auth/users',
      { userName: 'angelica' },
      { headers: { 'Content-Type': 'text/plain' } },
    );

    expect(getHeaders()['Content-Type']).toBe('text/plain');
  });

  it('does not set Content-Type for requests without a body', async () => {
    await apiClient.get('/auth/users/1');

    expect(getHeaders()['Content-Type']).toBeUndefined();
    expect(getRequestInit().body).toBeUndefined();
  });
});
