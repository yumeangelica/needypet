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
            this.$patch((state) => {
              state.pets = response.data;
            });
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
    /**
     * @description Add a new pet to the server
     * @param newPetObject
     * @returns
     */
    async addNewPet(newPetObject): Promise<boolean> {
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
    /**
     * @description Delete a pet by Id
     * @param petId
     * @returns
     */
    async deletePet(petId: string): Promise<boolean> {
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
    /**
     * @description Update the pet by Id
     * @param petId
     * @param petData
     * @returns
     */
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
          this.$patch((state) => {
            state.pets = state.pets.filter((pet) => pet.id !== petId);
          });
          await this.getAllPets(); // Fetch all pets again to update the state
          return true;
        }
      } catch (error) {
        console.error('Error during updating pet:', error.response?.status);
        return false;
      }
    },
    /**
     * @description Toggle the status isActive of the need
     * @param petId
     * @param needId
     * @returns
     */
    async toggleNeedisActive(petId: string, needId: string): Promise<boolean> {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        console.log('Token not found');
        return false;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await axiosInstance({
          method: 'patch',
          url: `${servicePath}/pets/${petId}/needs/${needId}/togglestatus`,
          headers,
        });

        if (response.status === 200) {
          this.$patch((state) => {
            const pet = state.pets.find((pet) => pet.id === petId);
            if (pet) {
              const need = pet.needs.find((need) => need.id === needId);
              if (need) {
                need.isActive = !need.isActive;
              }
            }
          });
          return true;
        }
      } catch (error) {
        console.error(
          'Error during toggling need status:',
          error.response?.status
        );
        return false;
      }
    },
    /**
     * @description Update the pet's need by Id
     * @param petId
     * @param needId
     * @param updatedNeed
     * @returns
     */
    async updateNeed(petId: string, needId: string, updatedNeed: object) {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        console.log('Token not found');
        return false;
      }

      console.log('Updated need:', updatedNeed);
      console.log('Need ID:', needId);

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await axiosInstance({
          method: 'put',
          url: `${servicePath}/pets/${petId}/needs/${needId}`,
          headers,
          data: updatedNeed,
        });

        if (response.status === 200) {
          this.$patch((state) => {
            const stateNeed = state.pets
              .find((pet) => pet.id === petId)
              ?.needs.find((need) => need.id === needId);
            if (stateNeed) {
              const responseNeed = response.data.needs.find(
                (need) => need.id === needId
              );
              if (responseNeed) {
                Object.assign(stateNeed, responseNeed);
              }
            }
          });
          return true;
        }
      } catch (error) {
        console.error('Error during updating need:', error.response?.status);
        return false;
      }

      return false;
    },
    /**
     * @description Delete a need from the pet by Id
     * @param petId
     * @param needId
     * @returns
     */
    async deleteNeed(petId: string, needId: string): Promise<boolean> {
      const userStore = useUserStore();

      const token = userStore.token;

      if (!token) {
        console.log('Token not found');
        return false;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await axiosInstance({
          method: 'delete',
          url: `${servicePath}/pets/${petId}/needs/${needId}`,
          headers,
        });

        if (response.status === 204) {
          this.$patch((state) => {
            const pet = state.pets.find((pet) => pet.id === petId);
            if (pet) {
              pet.needs = pet.needs.filter((need) => need.id !== needId);
            }
          });
          return true;
        }
      } catch (error) {
        console.error('Error during deleting need:', error.response?.status);
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
    // Gets the owner's pets from the state and returns them
    getOwnerPets: (state) => async (): Promise<Pet[]> => {
      const userStore = useUserStore();
      return state.pets.filter((pet) => pet.owner.id === userStore.id);
    },
    // Gets the carer's pets from the state and returns them
    getCarerPets: (state) => async (): Promise<Pet[]> => {
      const userStore = useUserStore();
      return state.pets.filter((pet) => pet.owner.id !== userStore.id);
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
