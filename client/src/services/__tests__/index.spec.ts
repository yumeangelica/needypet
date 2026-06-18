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
});
