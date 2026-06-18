import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the API client used by the pet store.
vi.mock('@/services', () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from '@/services';
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';

const mockedApiClient = vi.mocked(apiClient);

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

  it('toggles local isActive and returns true on a 200 response', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await petStore.toggleNeedisActive('pet-1', 'need-1');

    expect(result).toBe(true);
    expect(petStore.pets[0].needs[0].isActive).toBe(false);

    expect(mockedApiClient).toHaveBeenCalledTimes(1);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.method).toBe('patch');
    expect(callArg.url).toBe('/api/pets/pet-1/needs/need-1/togglestatus');
  });

  it('returns false and leaves state unchanged when the request fails', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    // Network/CORS error: no response object on the error.
    mockedApiClient.mockRejectedValueOnce(new Error('Failed to fetch'));

    const result = await petStore.toggleNeedisActive('pet-1', 'need-1');

    expect(result).toBe(false);
    expect(petStore.pets[0].needs[0].isActive).toBe(true);
  });

  it('returns false without calling the API when there is no token', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    const result = await petStore.toggleNeedisActive('pet-1', 'need-1');

    expect(result).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });
});
