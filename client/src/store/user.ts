// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia';
import router from '@/router/index';
import { axiosInstance } from '@/services';
import { UserStoreState, User } from '@/types/user';

const servicePath = '/auth';

/**
 * @description Set an item in the local storage
 * @param key
 * @param value
 */
const setLocalStorageItem = async (
  key: string,
  value: string
): Promise<void> => {
  localStorage.setItem(key, value);
};

/**
 * @description Set the authentication data in the local storage and in the store
 * @param token
 * @param userName
 * @param id
 */
const setAuthData = async (
  token: string,
  userName: string,
  id: string
): Promise<void> => {
  const userStore = useUserStore(); // get the user store
  await setLocalStorageItem('token', token);
  await setLocalStorageItem('userName', userName);
  await setLocalStorageItem('id', id);
  userStore.$patch((state) => {
    state.token = token;
    state.userName = userName;
    state.id = id;
  });
};

/**
 * @description User store definition
 */
export const useUserStore = defineStore({
  id: 'user',
  state: (): UserStoreState => ({
    token: null,
    userName: null,
    id: null,
  }),
  actions: {
    async getUserById(id: string): Promise<User> {
      const response = axiosInstance({
        method: 'get',
        url: `${servicePath}/users/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            return response.data;
          }
          return null;
        })
        .catch((error) => {
          console.error('Error during get user by id:', error.response?.status);
          return null;
        });

      return response;
    },
    async logout(): Promise<void> {
      this.token = this.userName = this.id = null; // reset the store state
      localStorage.clear();
      router.push({ name: 'login' });
      window.location.href = '/login';
    },
    async login(userName: string, password: string): Promise<boolean> {
      const response = axiosInstance({
        method: 'post',
        url: `${servicePath}/login`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          userName,
          password,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            const { token, user } = response.data;
            return setAuthData(token, user.userName, user.id).then(() => {
              return true;
            });
          }
          return false;
        })
        .catch((error) => {
          console.error('Error during login:', error.response?.status);
          return false;
        });

      return response;
    },
    /**
     * @description Initialize the store from the local storage
     */
    async initializeFromLocalStorage(): Promise<void> {
      this.token = localStorage.getItem('token') || null;
      this.userName = localStorage.getItem('userName') || null;
      this.id = localStorage.getItem('id') || null;
    },
    /**
     * @description Check if the token is valid
     */
    async checkAndValidateToken(): Promise<boolean> {
      if (!this.token) {
        return false;
      }

      const response = axiosInstance({
        method: 'post',
        url: `${servicePath}/validatetoken`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      })
        .then((response) => {
          return response.status === 200;
        })
        .catch((error) => {
          console.error(
            'Error during token validation:',
            error.response?.status
          );
          return false;
        });

      return response;
    },
  },
  getters: {
    /**
     * @description Check if the user is logged in
     * @param state
     * @returns
     */
    isLoggedIn: (state): boolean => !!state.token,
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
