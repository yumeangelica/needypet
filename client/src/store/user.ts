// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia';
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
  id: string,
  timezone: string
): Promise<void> => {
  const userStore = useUserStore(); // Get the user store
  await setLocalStorageItem('token', token);
  await setLocalStorageItem('userName', userName);
  await setLocalStorageItem('id', id);
  await setLocalStorageItem('timezone', timezone);
  userStore.$patch((state) => {
    state.token = token;
    state.userName = userName;
    state.id = id;
    state.timezone = timezone;
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
    timezone: null,
  }),
  actions: {
    async getUserById(id: string): Promise<User> {
      if (!id) {
        return null;
      }

      if (!this.token) {
        return null;
      }

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
    async createAccount({
      userName,
      email,
      newPassword,
      timezone,
    }): Promise<{ isSuccess: boolean; message: string }> {
      try {
        const response = await axiosInstance.post(`${servicePath}/users`, {
          userName,
          email,
          newPassword,
          timezone,
        });

        if (response.status === 201) {
          console.log('Account created successfully');

          return {
            isSuccess: true,
            message: 'Account created successfully',
          };

        } else {
          console.error(
            'Account creation failed with status: ',
            response.status
          );
          return {
            isSuccess: false,
            message: 'Account creation failed',
          };

        }
      } catch (error) {
        console.error(
          'Error creating account:',
          error.response?.data || error.message
        );
        if (error.response?.data.errors.userName) {
          return {
            isSuccess: false,
            message: 'Username already exists',
          };
        }
        if (error.response?.data.errors.email) {
          return {
            isSuccess: false,
            message: 'Email already exists',
          };
        }
      }
    },
    async updateUserProfile({
      userName,
      email,
      timezone,
      currentPassword,
    }): Promise<{isSuccess: boolean, message: string}> {
      try {
        const response = await axiosInstance.put(
          `${servicePath}/users/${this.id}`,
          { userName, email, timezone, currentPassword },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );

        if (response.status === 200) {
          // Update the store state
          this.$patch({
            userName: response.data.userName,
            email: response.data.email,
            timezone: response.data.timezone,
          });
          console.log('User updated successfully');
          return {
            isSuccess: true,
            message: 'User updated successfully',
          };
        }
        return {
          isSuccess: false,
          message: 'User update failed, please try again later',
        };
      } catch (error) {
        console.error(
          'Error updating user profile:',
          error.response?.data || error.message
        );
        if (error.response?.data.error) {
          return {
            isSuccess: false,
            message: error.response.data.error,
          };
        }
      }
    },
    async deleteAccount(): Promise<boolean> {
      try {
        const response = await axiosInstance.delete(
          `${servicePath}/users/${this.id}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );

        if (response.status === 204) {
          return true;
        } else {
          console.error(
            'Account deletion failed with status: ',
            response.status
          );
          return false;
        }
      } catch (error) {
        console.error(
          'Error deleting account:',
          error.response?.data || error.message
        );
        return false;
      }
    },
    logout(): Promise<void> {
      this.$reset();
      localStorage.clear();
      return Promise.resolve();
    },
    async login(userName: string, password: string): Promise<{ isSuccess: boolean; message: string }> {
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
      }).then((response) => {
        if (response.status === 200) {
          const { token, user } = response.data;
          return setAuthData(
            token,
            user.userName,
            user.id,
            user.timezone
          ).then(() => {
            return {
              isSuccess: true,
              message: 'Login successful',
            };
          });
        }
      }).catch((error) => {
        console.error('Error during login:', error.response?.status);
        if (error.response?.status === 401) {
          return {
            isSuccess: false,
            message: 'Invalid credentials',
          };
        }
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
      this.timezone = localStorage.getItem('timezone') || null;
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
