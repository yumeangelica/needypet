// Fetch-based API client — replaces axios.
// Drop-in: import { apiClient } from '@/services';

const baseURL: string = import.meta.env.VITE_APP_BACKEND_URL;

export interface ApiError extends Error {
  response?: {
    status: number;
    data: Record<string, unknown>;
  };
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'response' in error;
}

interface RequestOptions {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: unknown;
}

interface ApiResponse<T = unknown> {
  status: number;
  data: T;
}

/**
 * Thin wrapper around fetch that behaves like axios:
 *  – prepends baseURL
 *  – JSON-encodes body automatically
 *  – parses JSON response (or returns null for 204)
 *  – throws an ApiError with `error.response.status` and
 *    `error.response.data` on non-2xx responses, so every
 *    existing catch-block keeps working.
 */
async function request<T = unknown>(opts: RequestOptions): Promise<ApiResponse<T>> {
  const url = `${baseURL}${opts.url}`;

  const headers: Record<string, string> = { ...(opts.headers || {}) };

  const fetchOpts: RequestInit = {
    method: opts.method,
    headers,
  };

  if (opts.data !== undefined) {
    // Match axios: default the Content-Type for JSON bodies unless the caller
    // already set it, so the backend's JSON body parser runs.
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    fetchOpts.body = JSON.stringify(opts.data);
  }

  const res = await fetch(url, fetchOpts);

  // Parse body (204 No Content → null)
  let data: T | null = null;
  const contentType = res.headers.get('content-type');
  if (res.status !== 204 && contentType?.includes('application/json')) {
    data = (await res.json()) as T;
  }

  if (!res.ok) {
    const err: ApiError = new Error(`Request failed with status ${res.status}`);
    err.response = {
      status: res.status,
      data: (data as Record<string, unknown>) ?? {},
    };
    throw err;
  }

  return { status: res.status, data: data as T };
}

// Convenience shorthands matching the old axios.get / .post / … surface
export const apiClient = Object.assign(
  // Callable form: apiClient({ method, url, headers, data })
  <T = unknown>(opts: RequestOptions): Promise<ApiResponse<T>> => request<T>(opts),
  {
    get<T = unknown>(
      url: string,
      config?: { headers?: Record<string, string> },
    ): Promise<ApiResponse<T>> {
      return request<T>({ method: 'get', url, headers: config?.headers });
    },

    post<T = unknown>(
      url: string,
      data?: unknown,
      config?: { headers?: Record<string, string> },
    ): Promise<ApiResponse<T>> {
      return request<T>({ method: 'post', url, headers: config?.headers, data });
    },

    put<T = unknown>(
      url: string,
      data?: unknown,
      config?: { headers?: Record<string, string> },
    ): Promise<ApiResponse<T>> {
      return request<T>({ method: 'put', url, headers: config?.headers, data });
    },

    patch<T = unknown>(
      url: string,
      data?: unknown,
      config?: { headers?: Record<string, string> },
    ): Promise<ApiResponse<T>> {
      return request<T>({ method: 'patch', url, headers: config?.headers, data });
    },

    delete<T = unknown>(
      url: string,
      config?: { headers?: Record<string, string> },
    ): Promise<ApiResponse<T>> {
      return request<T>({ method: 'delete', url, headers: config?.headers });
    },
  },
);
