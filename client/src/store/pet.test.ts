import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resultMessage } from '@/lib/apiError';
import { apiClient } from '@/services';
import { usePetStore } from './pet';
import { useUserStore } from './user';

vi.mock('@/services', () => {
  const apiClient = Object.assign(vi.fn(), {
    post: vi.fn(),
  });

  return {
    apiClient,
    isApiError: (error: unknown) => error instanceof Error && 'response' in error,
  };
});

const apiError = (status: number, data: Record<string, unknown>) => {
  const error = new Error('Request failed');
  Object.assign(error, { response: { status, data } });
  return error;
};

describe('pet store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(apiClient).mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it('adds a pet and refreshes the pet list on success', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';
    const petStore = usePetStore();

    vi.mocked(apiClient.post).mockResolvedValue({ status: 201, data: {} });
    vi.mocked(apiClient).mockResolvedValue({
      status: 200,
      data: [
        {
          id: 'pet-1',
          name: 'Momo',
        },
      ],
    });

    const result = await petStore.addNewPet({
      name: 'Momo',
      breed: 'mix',
      species: 'cat',
      description: 'sleepy',
      birthday: null,
    });

    expect(result).toEqual({ isSuccess: true });
    expect(petStore.pets).toEqual([{ id: 'pet-1', name: 'Momo' }]);
  });

  it('surfaces the backend message when the create request fails', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';
    const petStore = usePetStore();

    vi.mocked(apiClient.post).mockRejectedValue(apiError(400, { message: 'Name already exists' }));

    const result = await petStore.addNewPet({
      name: 'Momo',
      breed: 'mix',
      species: 'cat',
      description: 'sleepy',
      birthday: null,
    });

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Name already exists');
    expect(apiClient).not.toHaveBeenCalled();
    expect(petStore.pets).toEqual([]);
  });

  it('toggles a need active status and reports success', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';
    const petStore = usePetStore();
    petStore.pets = [
      { id: 'pet-1', needs: [{ id: 'need-1', isActive: true }] },
    ] as unknown as typeof petStore.pets;

    vi.mocked(apiClient).mockResolvedValue({ status: 200, data: {} });

    const result = await petStore.toggleNeedisActive('pet-1', 'need-1');

    expect(result).toEqual({ isSuccess: true });
    expect(petStore.pets[0].needs?.[0].isActive).toBe(false);
  });

  it('surfaces the backend message when a need action fails', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';
    const petStore = usePetStore();

    vi.mocked(apiClient).mockRejectedValue(
      apiError(400, { message: 'Validation error', errorDetails: { category: ['Too short'] } }),
    );

    const result = await petStore.addNewNeed('pet-1', { category: 'a' });

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Validation error');
    expect(result.errorDetails).toEqual({ category: ['Too short'] });
  });
});

describe('resultMessage', () => {
  it('prefers the first per-field error', () => {
    expect(
      resultMessage(
        {
          isSuccess: false,
          message: 'Validation error',
          errorDetails: { category: ['Too short'] },
        },
        'fallback',
      ),
    ).toBe('Too short');
  });

  it('falls back to the result message, then the fallback', () => {
    expect(resultMessage({ isSuccess: false, message: 'Boom' }, 'fallback')).toBe('Boom');
    expect(resultMessage({ isSuccess: false }, 'fallback')).toBe('fallback');
  });
});
