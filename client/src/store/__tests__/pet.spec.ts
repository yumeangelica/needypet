import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiError } from '@/services';

// Mock the API client used by the pet store, but keep the real isApiError guard
// so the store's error handling (via @/lib/apiError) behaves like production.
vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  // apiClient is Object.assign(fn, { post, put, patch, delete, get }).
  // Attach sub-methods and forward to the main mock so mockResolvedValueOnce
  // and call assertions work on a single instance.
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
import { usePetStore } from '@/store/pet';
import { useUserStore } from '@/store/user';

const mockedApiClient = vi.mocked(apiClient);

// Build an error shaped like the one the real client throws (Error + response).
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
    resetMock();
  });

  it('toggles local isActive and succeeds on a 200 response', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await petStore.toggleNeedisActive('pet-1', 'need-1');

    expect(result.isSuccess).toBe(true);
    expect(petStore.pets[0].needs?.[0].isActive).toBe(false);

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
    expect(petStore.pets[0].needs?.[0].isActive).toBe(true);
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
    resetMock();
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

  it('appends the new need to local state on success', async () => {
    const userStore = useUserStore();
    userStore.token = 'test-token';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    const newNeed = { id: 'need-2', category: 'Walk', isActive: true };
    // addNewNeed calls getAllPets after success; stub both calls
    mockedApiClient
      .mockResolvedValueOnce({
        status: 201,
        data: { needs: [{ id: 'need-1', isActive: true }, newNeed] },
      })
      .mockResolvedValueOnce({ status: 200, data: [petStore.pets[0]] });

    const result = await petStore.addNewNeed('pet-1', { category: 'Walk' });

    expect(result.isSuccess).toBe(true);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.url).toBe('/api/pets/pet-1/newneed');
    expect(callArg.data).toEqual({ need: { category: 'Walk' } });
  });

  it('returns isSuccess false without calling API when token is missing', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const petStore = usePetStore();

    const result = await petStore.addNewNeed('pet-1', { category: 'Walk' });

    expect(result.isSuccess).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });
});

describe('pet store - getAllPets', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('stores fetched pets in state on 200', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();

    const pets = [
      { id: 'pet-1', name: 'Milo' },
      { id: 'pet-2', name: 'Luna' },
    ];
    mockedApiClient.mockResolvedValueOnce({ status: 200, data: pets });

    const result = await petStore.getAllPets();

    expect(result).toBe(true);
    expect(petStore.pets).toHaveLength(2);
    expect(petStore.pets[0].name).toBe('Milo');
  });

  it('returns false without calling API when token is missing', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const petStore = usePetStore();

    const result = await petStore.getAllPets();

    expect(result).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });

  it('returns false on a network error', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();

    mockedApiClient.mockRejectedValueOnce(new Error('network'));

    const result = await petStore.getAllPets();

    expect(result).toBe(false);
  });
});

describe('pet store - addNewPet', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('returns success and fetches pets on 201', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();

    const newPet = { id: 'pet-1', name: 'Milo', owner: { id: 'uid-1' } };
    mockedApiClient
      .mockResolvedValueOnce({ status: 201, data: newPet })
      .mockResolvedValueOnce({ status: 200, data: [newPet] });

    const result = await petStore.addNewPet({ name: 'Milo' } as Parameters<
      typeof petStore.addNewPet
    >[0]);

    expect(result.isSuccess).toBe(true);
  });

  it('returns error message on failure', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();

    mockedApiClient.mockRejectedValueOnce(apiError(422, { message: 'Name too short' }));

    const result = await petStore.addNewPet({ name: 'x' } as Parameters<
      typeof petStore.addNewPet
    >[0]);

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Name too short');
  });
});

describe('pet store - deletePet', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('returns success and refreshes pets on 204', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient
      .mockResolvedValueOnce({ status: 204, data: {} })
      .mockResolvedValueOnce({ status: 200, data: [] });

    const result = await petStore.deletePet('pet-1');

    expect(result.isSuccess).toBe(true);
  });

  it('returns error on 401', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockRejectedValueOnce(apiError(401, { message: 'Unauthorized' }));

    const result = await petStore.deletePet('pet-1');

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Unauthorized');
  });
});

describe('pet store - updatePet', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('returns success on 200 and refreshes pets', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    const updatedPet = { id: 'pet-1', name: 'Milo Updated' };
    mockedApiClient
      .mockResolvedValueOnce({ status: 200, data: updatedPet })
      .mockResolvedValueOnce({ status: 200, data: [updatedPet] });

    const result = await petStore.updatePet(
      'pet-1',
      updatedPet as Parameters<typeof petStore.updatePet>[1],
    );

    expect(result.isSuccess).toBe(true);
  });

  it('surfaces backend error message on failure', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockRejectedValueOnce(apiError(401, { message: 'Not the owner' }));

    const result = await petStore.updatePet(
      'pet-1',
      {} as Parameters<typeof petStore.updatePet>[1],
    );

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Not the owner');
  });
});

describe('pet store - updateNeed', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('patches the local need and returns success on 200', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockResolvedValueOnce({
      status: 200,
      data: { needs: [{ id: 'need-1', isActive: true, category: 'Walk updated' }] },
    });

    const result = await petStore.updateNeed('pet-1', 'need-1', { category: 'Walk updated' });

    expect(result.isSuccess).toBe(true);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.method).toBe('put');
    expect(callArg.url).toBe('/api/pets/pet-1/needs/need-1');
  });

  it('returns isSuccess false without API call when no token', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    const result = await petStore.updateNeed('pet-1', 'need-1', {});

    expect(result.isSuccess).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });

  it('surfaces error message on 404', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockRejectedValueOnce(apiError(404, { message: 'Need not found' }));

    const result = await petStore.updateNeed('pet-1', 'unknown-need', {});

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Need not found');
  });
});

describe('pet store - deleteNeed', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('removes need from local state and returns success on 204', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockResolvedValueOnce({ status: 204, data: {} });

    const result = await petStore.deleteNeed('pet-1', 'need-1');

    expect(result.isSuccess).toBe(true);
    expect(petStore.pets[0].needs).toHaveLength(0);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.method).toBe('delete');
    expect(callArg.url).toBe('/api/pets/pet-1/needs/need-1');
  });

  it('returns isSuccess false without API call when no token', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    const result = await petStore.deleteNeed('pet-1', 'need-1');

    expect(result.isSuccess).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });
});

describe('pet store - addRecord', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('pushes record to local state and marks completed on 201', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    const record = {
      note: 'Done',
      duration: { value: 30, unit: 'minutes' },
      timezone: 'Europe/Helsinki',
    };
    mockedApiClient.mockResolvedValueOnce({ status: 201, data: {} });

    const result = await petStore.addRecord(
      'pet-1',
      'need-1',
      record as Parameters<typeof petStore.addRecord>[2],
    );

    expect(result.isSuccess).toBe(true);
    expect(petStore.pets[0].needs?.[0].completed).toBe(true);
    const callArg = mockedApiClient.mock.calls[0][0];
    expect(callArg.method).toBe('post');
    expect(callArg.url).toBe('/api/pets/pet-1/needs/need-1/newrecord');
  });

  it('returns isSuccess false without API call when no token', async () => {
    const userStore = useUserStore();
    userStore.token = null;

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    const result = await petStore.addRecord(
      'pet-1',
      'need-1',
      {} as Parameters<typeof petStore.addRecord>[2],
    );

    expect(result.isSuccess).toBe(false);
    expect(mockedApiClient).not.toHaveBeenCalled();
  });

  it('surfaces error message on failure', async () => {
    const userStore = useUserStore();
    userStore.token = 'tok-abc';

    const petStore = usePetStore();
    seedPetWithNeed(petStore);

    mockedApiClient.mockRejectedValueOnce(apiError(404, { message: 'Need not found' }));

    const result = await petStore.addRecord(
      'pet-1',
      'bad-need',
      {} as Parameters<typeof petStore.addRecord>[2],
    );

    expect(result.isSuccess).toBe(false);
    expect(result.message).toBe('Need not found');
  });
});

describe('pet store - getters', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetMock();
  });

  it('getOwnerPets returns pets owned by the current user', async () => {
    const userStore = useUserStore();
    userStore.id = 'uid-1';

    const petStore = usePetStore();
    petStore.pets = [
      { id: 'pet-1', owner: { id: 'uid-1' } },
      { id: 'pet-2', owner: { id: 'uid-2' } },
    ] as unknown as typeof petStore.pets;

    const owned = await petStore.getOwnerPets();
    expect(owned).toHaveLength(1);
    expect(owned[0].id).toBe('pet-1');
  });

  it('getCarerPets returns pets NOT owned by the current user', async () => {
    const userStore = useUserStore();
    userStore.id = 'uid-1';

    const petStore = usePetStore();
    petStore.pets = [
      { id: 'pet-1', owner: { id: 'uid-1' } },
      { id: 'pet-2', owner: { id: 'uid-2' } },
    ] as unknown as typeof petStore.pets;

    const cared = await petStore.getCarerPets();
    expect(cared).toHaveLength(1);
    expect(cared[0].id).toBe('pet-2');
  });

  it('getPetById returns the correct pet', async () => {
    const petStore = usePetStore();
    petStore.pets = [
      { id: 'pet-1', name: 'Milo' },
      { id: 'pet-2', name: 'Luna' },
    ] as unknown as typeof petStore.pets;

    const pet = await petStore.getPetById('pet-2');
    expect(pet?.name).toBe('Luna');
  });

  it('getPetById returns undefined for unknown id', async () => {
    const petStore = usePetStore();
    petStore.pets = [] as typeof petStore.pets;

    const pet = await petStore.getPetById('unknown');
    expect(pet).toBeUndefined();
  });

  it('isOwner returns true when the user owns the pet', async () => {
    const userStore = useUserStore();
    userStore.id = 'uid-1';

    const petStore = usePetStore();
    petStore.pets = [{ id: 'pet-1', owner: { id: 'uid-1' } }] as unknown as typeof petStore.pets;

    expect(await petStore.isOwner('pet-1')).toBe(true);
  });

  it('isOwner returns false for a pet owned by another user', async () => {
    const userStore = useUserStore();
    userStore.id = 'uid-1';

    const petStore = usePetStore();
    petStore.pets = [{ id: 'pet-2', owner: { id: 'uid-2' } }] as unknown as typeof petStore.pets;

    expect(await petStore.isOwner('pet-2')).toBe(false);
  });
});
