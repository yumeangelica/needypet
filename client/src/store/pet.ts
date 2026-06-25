// @ts-check
import { acceptHMRUpdate, defineStore } from 'pinia';
import { type ApiResult, getErrorDetails, getErrorMessage } from '@/lib/apiError';
import { apiClient } from '@/services';
import type { CareRecord, Need, NewPetObject, Pet, PetState } from '@/types/pet';
import { useUserStore } from './user';

const servicePath = '/api';

export const usePetStore = defineStore('pet', {
  state: (): PetState => ({
    pets: [],
  }),
  actions: {
    /**
     * @description Get all user's pets from the server
     * @returns
     */
    async getAllPets(): Promise<ApiResult> {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        return { isSuccess: false };
      }

      // Headers for the request
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await apiClient<Pet[]>({
          method: 'get',
          url: `${servicePath}/pets`,
          headers,
        });

        if (response.status === 200) {
          this.$patch((state) => {
            state.pets = response.data;
          });
          return { isSuccess: true };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Error fetching pets'),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Add a new pet to the server
     * @param newPetObject
     * @returns
     */
    async addNewPet(newPetObject: NewPetObject): Promise<ApiResult> {
      const userStore = useUserStore();

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      };

      try {
        const response = await apiClient.post(`${servicePath}/pets`, newPetObject, { headers });
        if (response.status === 201) {
          await this.getAllPets(); // Fetch all pets again to update the state
          return { isSuccess: true };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Error adding pet'),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Delete a pet by Id
     * @param petId
     * @returns
     */
    async deletePet(petId: string): Promise<ApiResult> {
      const userStore = useUserStore();

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      };

      try {
        const response = await apiClient.delete(`${servicePath}/pets/${petId}`, { headers });
        if (response.status === 204) {
          await this.getAllPets(); // Fetch all pets again to update the state
          return { isSuccess: true };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Error deleting pet'),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Update the pet by Id
     * @param petId
     * @param petData
     * @returns
     */
    async updatePet(petId: string, petData: Pet): Promise<ApiResult> {
      const userStore = useUserStore();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      };

      try {
        const response = await apiClient.put(`${servicePath}/pets/${petId}`, petData, { headers });
        if (response.status === 200) {
          this.$patch((state) => {
            state.pets = state.pets.filter((pet) => pet.id !== petId);
          });
          await this.getAllPets(); // Fetch all pets again to update the state
          return { isSuccess: true };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Error updating pet'),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Toggle the status isActive of the need
     * @param petId
     * @param needId
     * @returns
     */
    async toggleNeedisActive(petId: string, needId: string): Promise<ApiResult> {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        return { isSuccess: false };
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await apiClient<{ needs: Need[] }>({
          method: 'patch',
          url: `${servicePath}/pets/${petId}/needs/${needId}/togglestatus`,
          headers,
        });

        if (response.status === 200) {
          this.$patch((state) => {
            const pet = state.pets.find((pet) => pet.id === petId);
            if (pet) {
              const need = pet.needs?.find((need) => need.id === needId);
              if (need) {
                const responseNeed = response.data.needs.find((need) => need.id === needId);
                if (responseNeed) {
                  Object.assign(need, responseNeed);
                }
              }
            }
          });
          return { isSuccess: true };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Failed to toggle need active status'),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Update the pet's need by Id
     * @param petId
     * @param needId
     * @param updatedNeed
     * @returns
     */
    async updateNeed(petId: string, needId: string, updatedNeed: object): Promise<ApiResult> {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        return { isSuccess: false };
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await apiClient<{ needs: Need[] }>({
          method: 'put',
          url: `${servicePath}/pets/${petId}/needs/${needId}`,
          headers,
          data: updatedNeed,
        });

        if (response.status === 200) {
          this.$patch((state) => {
            const stateNeed = state.pets
              .find((pet) => pet.id === petId)
              ?.needs?.find((need) => need.id === needId);
            if (stateNeed) {
              const responseNeed = response.data.needs.find((need) => need.id === needId);
              if (responseNeed) {
                Object.assign(stateNeed, responseNeed);
              }
            }
          });
          return { isSuccess: true };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Failed to update need'),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Delete a need from the pet by Id
     * @param petId
     * @param needId
     * @returns
     */
    async deleteNeed(petId: string, needId: string): Promise<ApiResult> {
      const userStore = useUserStore();

      const token = userStore.token;

      if (!token) {
        return { isSuccess: false };
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await apiClient({
          method: 'delete',
          url: `${servicePath}/pets/${petId}/needs/${needId}`,
          headers,
        });

        if (response.status === 204) {
          this.$patch((state) => {
            const pet = state.pets.find((pet) => pet.id === petId);
            if (pet) {
              pet.needs = pet.needs?.filter((need) => need.id !== needId);
            }
          });
          return { isSuccess: true };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Failed to delete need'),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Add a record for the need
     * @param petId
     * @param recordObject
     * @returns
     */
    async addRecord(petId: string, needId: string, recordObject: CareRecord): Promise<ApiResult> {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        return { isSuccess: false };
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await apiClient<{ needs: Need[] }>({
          method: 'post',
          url: `${servicePath}/pets/${petId}/needs/${needId}/newrecord`,
          headers,
          data: recordObject,
        });

        if (response.status === 201) {
          this.$patch((state: PetState) => {
            const pet = state.pets.find((pet) => pet.id === petId);
            if (pet) {
              const need = pet.needs?.find((need) => need.id === needId);
              if (need) {
                const responseNeed = response.data.needs?.find((need) => need.id === needId);
                if (responseNeed) {
                  Object.assign(need, responseNeed);
                  return;
                }

                if (!need.careRecords) {
                  need.careRecords = [];
                }
                need.careRecords.push(recordObject as CareRecord);
              }
            }
          });
          return { isSuccess: true };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Failed to add record'),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Add new need for the pet
     * @param petId
     * @param needObject
     * @returns
     */
    async addNewNeed(petId: string, needObject: object): Promise<ApiResult> {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        return { isSuccess: false };
      }

      const headers = {
        // Headers for the request
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await apiClient<{ needs: Need[] }>({
          method: 'post',
          url: `${servicePath}/pets/${petId}/newneed`,
          headers,
          data: {
            need: needObject,
          },
        });

        if (response.status === 201) {
          this.$patch((state) => {
            const pet = state.pets.find((pet: Pet) => pet.id === petId);
            if (pet) {
              const newNeed = response.data.needs[response.data.needs.length - 1];
              pet.needs = [...(pet.needs ?? []), newNeed];
            }
          });
          return { isSuccess: true };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, "Couldn't save the need. Please try again."),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
  },
  getters: {
    // Gets the owner's pets from the state and returns them
    getOwnerPets: (state) => async (): Promise<Pet[]> => {
      const userStore = useUserStore();
      return state.pets.filter((pet) => pet.owner?.id === userStore.id);
    },
    // Gets the carer's pets from the state and returns them
    getCarerPets: (state) => async (): Promise<Pet[]> => {
      const userStore = useUserStore();
      return state.pets.filter((pet) => pet.owner?.id !== userStore.id);
    },
    // Gets the pet by id from the state and returns it
    getPetById:
      (state) =>
      async (id: string): Promise<Pet | undefined> => {
        return state.pets.find((pet) => pet.id === id);
      },
    // Checks if the user is the owner of the pet
    isOwner:
      (state) =>
      async (petId: string): Promise<boolean> => {
        const userStore = useUserStore();
        const pet = state.pets.find((pet) => pet.id === petId);
        return pet?.owner?.id === userStore.id;
      },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePetStore, import.meta.hot));
}
