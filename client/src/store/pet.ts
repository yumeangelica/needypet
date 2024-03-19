// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia'
import { axiosInstance } from '@/services';
import { useUserStore } from './user';
import { PetState, Pet } from '@/types/pet';

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

      const headers = { // headers for the request
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      };

      const response = axiosInstance({
        method: 'get',
        url: `${servicePath}/pets`,
        headers
      })
      .then((response) => {
        if (response.status === 200) {
          this.pets = response.data; // set the pets in the store state
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

      const headers = { // headers for the request
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      };

      const response = axiosInstance({
        method: 'post',
        url: `${servicePath}/pets/${petId}/newneed`,
        headers,
        data: {
          need : needObject
        }
      })
      .then((response) => {
        this.$patch((state) => {
          const pet = state.pets.find(pet => pet.id === petId);
          if (pet) {
            pet.needs.push(needObject);
          }
        });
        return response.status === 201;
      })

        .catch((error) => {
        console.error('Error during adding new need:', error.response?.status);
        return false;
      });

      return response;

    }
  },
  getters: {
    getOwnerPets: (state) => async (): Promise<Pet[]> => {
      const userStore = useUserStore();
      return state.pets.filter(pet => pet.owner.id === userStore.id);
    },
    getCarerPets: (state) => async (): Promise<Pet[]> => {
      const userStore = useUserStore();
      return state.pets.filter(pet => pet.owner.id !== userStore.id);
    },
    getPetById: (state) => async (id: string): Promise<Pet | undefined> => {
      return state.pets.find(pet => pet.id === id);
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePetStore, import.meta.hot))
}