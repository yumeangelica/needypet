import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiError } from '@/services';

// Mock the API client used by the pet store, but keep the real isApiError guard
// so the store's error handling (via @/lib/apiError) behaves like production.
vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  return { ...actual, apiClient: vi.fn() };
});

import { apiClient } from '@/services';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';

const mockedApiClient = vi.mocked(apiClient);

// Build an error shaped like the one the real client throws (Error + response).
const apiError = (status: number, data: Record<string, unknown> = {}): ApiError => {
  const error = new Error(`Request failed with status ${status}`) as ApiError;
  error.response = { status, data };
  return error;
};

const seedPetWithNeed = (store: ReturnType<typeof usePetStore>) => {
  store.pets = [
    {
      id: 'pet-1',
      needs: [{ id: 'need-1', isActive: true }],
    },
    // The store is loosely typed for pets; cast keeps the test focused on toggle logic.
  ] as unknown as typeof store.pets;
};

describe('pet store - toggleNeedisActive', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockedApiClient.mockReset();
  });

  it('toggles local isActive and succeeds on a 200 response', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await petStore.toggleNeedisActive('pet-1', 'need-1');

    expect(result.isSuccess).toBe(true);
    expect(petStore.pets[0].needs[0].isActive).toBe(false);

    expect(mockedApiClient).toHaveBeenCalledTimes(1);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.method).toBe('patch');
    expect(callArg.url).toBe('/api/pets/pet-1/needs/need-1/togglestatus');
  });

  it('fails and leaves state unchanged on a network error', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    // Network/CORS error: no response object on the error.
    mockedApiClient.mockRejectedValueOnce(new Error('Failed to fetch'));

    const result = await petStore.toggleNeedisActive('pet-1', 'need-1');

    expect(result.isSuccess).toBe(false);
    expect(petStore.pets[0].needs[0].isActive).toBe(true);
  });

  it('fails without calling the API when there is no token', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    const result = await petStore.toggleNeedisActive('pet-1', 'need-1');

    expect(result.isSuccess).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });
});

describe('pet store - addNewNeed', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockedApiClient.mockReset();
  });

  it('surfaces the backend validation message on failure', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockRejectedValueOnce(
      apiError(422, { message: 'Category must be at least 3 characters' }),
    );

    const result = await petStore.addNewNeed('pet-1', { category: 'ab' });

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Category must be at least 3 characters');
  });
});
