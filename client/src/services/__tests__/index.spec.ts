import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/services';

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes request methods before calling fetch', async () => {
    const fetchMock = vi.mocked(fetch);

    await apiClient({ method: 'patch', url: '/api/test' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('sets application/json when a request body is sent without a content type', async () => {
    const fetchMock = vi.mocked(fetch);

    await apiClient.post('/auth/users', { userName: 'testUser' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('preserves a caller-provided content type case-insensitively', async () => {
    const fetchMock = vi.mocked(fetch);

    await apiClient.post(
      '/api/upload',
      { ok: true },
      { headers: { 'content-type': 'application/vnd.api+json' } },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'content-type': 'application/vnd.api+json',
        }),
      }),
    );
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();
  });
});
