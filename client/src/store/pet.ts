// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia';
import { axiosInstance } from '@/services';
import { useUserStore } from './user';
import { PetState, Pet, CareRecord } from '@/types/pet';

const servicePath = '/api';

export const usePetStore = defineStore({
  id: 'pet',
  state: (): PetState => ({
    pets: [],
  }),
  actions: {
    /**
     * @description Get all user's pets from the server
     * @returns
     */
    async getAllPets(): Promise<boolean> {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        console.log('Token not found');
        return false;
      }

      // Headers for the request
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      };

      const response = axiosInstance({
        method: 'get',
        url: `${servicePath}/pets`,
        headers,
      })
        .then((response) => {
          if (response.status === 200) {
            this.pets = response.data; // Set the pets in the store state
            return true;
          }
          return false;
        })
        .catch((error) => {
          console.error('Error during pets fetching:', error.response?.status);
          return false;
        });

      return response;
    },
    async addNewPet(newPetObject) {
      const userStore = useUserStore();

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      };

      try {
        const response = await axiosInstance.post(
          `${servicePath}/pets`,
          newPetObject,
          { headers }
        );
        if (response.status === 201) {
          await this.getAllPets(); // Fetch all pets again to update the state
          return true;
        }
      } catch (error) {
        console.error('Error during adding new pet:', error.response?.status);
        return false;
      }
    },
    async deletePet(petId: string) {
      const userStore = useUserStore();

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      };

      try {
        const response = await axiosInstance.delete(
          `${servicePath}/pets/${petId}`,
          { headers }
        );
        if (response.status === 204) {
          await this.getAllPets(); // Fetch all pets again to update the state
          return true;
        }
      } catch (error) {
        console.error('Error during deleting pet:', error.response?.status);
        return false;
      }
    },
    async updatePet(petId, petData) {
      const userStore = useUserStore();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      };

      try {
        const response = await axiosInstance.put(
          `${servicePath}/pets/${petId}`,
          petData,
          { headers }
        );
        if (response.status === 200) {
          await this.getAllPets(); // Fetch all pets again to update the state
          return true;
        }
      } catch (error) {
        console.error('Error during updating pet:', error.response?.status);
        return false;
      }
    },
    /**
     * @description Add a record for the need
     * @param petId
     * @param recordObject
     * @returns
     */
    async addRecord(
      petId: string,
      needId: string,
      recordObject: CareRecord
    ): Promise<boolean> {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        console.log('Token not found');
        return false;
      }

      const headers = {
        // Headers for the request
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      };

      const response = axiosInstance({
        method: 'post',
        url: `${servicePath}/pets/${petId}/needs/${needId}/newrecord`,
        headers,
        data: recordObject,
      })
        .then((response) => {
          if (response.status === 201) {
            this.$patch((state: PetState) => {
              const pet = state.pets.find((pet) => pet.id === petId);
              if (pet) {
                const need = pet.needs.find((need) => need.id === needId);
                if (need) {
                  need.careRecords.push(recordObject);
                }
              }
            });
            return true;
          }
          return false;
        })
        .catch((error) => {
          if (error) {
            return false;
          }
        });

      return response;
    },
    /**
     * @description Add new need for the pet
     * @param petId
     * @param needObject
     * @returns
     */
    async addNewNeed(petId: string, needObject: object): Promise<boolean> {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        console.log('Token not found');
        return false;
      }

      const headers = {
        // Headers for the request
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      };

      const response = axiosInstance({
        method: 'post',
        url: `${servicePath}/pets/${petId}/newneed`,
        headers,
        data: {
          need: needObject,
        },
      })
        .then((response) => {
          this.$patch((state) => {
            const pet = state.pets.find((pet: Pet) => pet.id === petId);
            if (pet) {
              const newNeed =
                response.data.needs[response.data.needs.length - 1];
              pet.needs.push(newNeed);
            }
          });
          return response.status === 201;
        })

        .catch((error) => {
          console.error(
            'Error during adding new need:',
            error.response?.status
          );
          return false;
        });

      return response;
    },
  },
  getters: {
    getOwnerPets: (state) => async (): Promise<Pet[]> => {
      const userStore = useUserStore();
      return state.pets.filter((pet) => pet.owner.id === userStore.id);
    },
    getCarerPets: (state) => async (): Promise<Pet[]> => {
      const userStore = useUserStore();
      return state.pets.filter((pet) => pet.owner.id !== userStore.id);
    },
    getPetById:
      (state) =>
        async (id: string): Promise<Pet | undefined> => {
          return state.pets.find((pet) => pet.id === id);
        },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePetStore, import.meta.hot));
}
