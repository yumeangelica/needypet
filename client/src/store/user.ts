// @ts-check
import { acceptHMRUpdate, defineStore } from 'pinia';
import { type ApiResult, getErrorDetails, getErrorMessage, getErrorStatus } from '@/lib/apiError';
import { apiClient } from '@/services';
import type { loginData, User, UserStoreState } from '@/types/user';

const servicePath = '/auth';

interface UpdateUserResponse {
  userName: string;
  email: string;
  timezone: string;
  message?: string;
}

interface MessageResponse {
  message?: string;
}

interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

/**
 * @description Set an item in the local storage
 * @param key
 * @param value
 */
const setLocalStorageItem = async (key: string, value: string): Promise<void> => {
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
  timezone: string,
  emailConfirmed: boolean,
): Promise<void> => {
  const userStore = useUserStore(); // Get the user store
  await setLocalStorageItem('token', token);
  await setLocalStorageItem('userName', userName);
  await setLocalStorageItem('id', id);
  await setLocalStorageItem('timezone', timezone);
  await setLocalStorageItem('emailConfirmed', emailConfirmed.toString());
  userStore.$patch((state) => {
    state.token = token;
    state.userName = userName;
    state.id = id;
    state.timezone = timezone;
    state.emailConfirmed = emailConfirmed;
  });
};

/**
 * @description User store definition
 */
export const useUserStore = defineStore('user', {
  state: (): UserStoreState => ({
    token: null,
    userName: null,
    id: null,
    timezone: 'UTC', // Dayjs default does not work with null
    emailConfirmed: null,
  }),
  actions: {
    /**
     * @description Get the user by id
     * @param id
     * @returns
     */
    async getUserById(id: string): Promise<User | null> {
      if (!id) {
        return null;
      }

      if (!this.token) {
        return null;
      }

      const response = apiClient<User>({
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
        .catch(() => null);

      return response;
    },
    /**
     * @description Create a new account
     * @param userName
     * @param email
     * @param newPassword
     * @param timezone
     * @returns
     */
    async createAccount({
      userName,
      email,
      newPassword,
      timezone,
    }: {
      userName: string;
      email: string;
      newPassword: string;
      timezone: string;
    }): Promise<ApiResult> {
      try {
        const response = await apiClient.post(`${servicePath}/users`, {
          userName,
          email,
          newPassword,
          timezone,
        });

        if (response.status === 201) {
          return {
            isSuccess: true,
            message:
              'Account created successfully, please check your email to confirm your account',
            errorDetails: null,
          };
        }
      } catch (error) {
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Error creating account'),
          errorDetails: getErrorDetails(error),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Update the user profile
     * @param userName
     * @param email
     * @param timezone
     * @param currentPassword
     * @returns
     */
    async updateUserProfile({
      userName,
      email,
      timezone,
      currentPassword,
    }: {
      userName: string;
      email: string;
      timezone: string;
      currentPassword: string;
    }): Promise<ApiResult> {
      try {
        const response = await apiClient.put<UpdateUserResponse>(
          `${servicePath}/users/${this.id}`,
          { userName, email, timezone, currentPassword },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );

        if (response.status === 200) {
          this.$patch({
            userName: response.data.userName,
            timezone: response.data.timezone,
          });
          await setLocalStorageItem('userName', response.data.userName);
          await setLocalStorageItem('email', response.data.email);
          await setLocalStorageItem('timezone', response.data.timezone);
          return {
            isSuccess: true,
            message: response.data.message || 'User updated successfully',
          };
        }
      } catch (error) {
        const status = getErrorStatus(error);

        if (status === 401) {
          return {
            isSuccess: false,
            message: getErrorMessage(error, 'Unauthorized'),
          };
        }

        if (status === 422) {
          return {
            isSuccess: false,
            message: getErrorMessage(error, 'Validation error'),
            errorDetails: getErrorDetails(error),
          };
        }

        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Error updating user profile'),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Change the user password
     * @param currentPassword
     * @param newPassword
     * @returns
     */
    async changePassword({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }): Promise<ApiResult> {
      try {
        const response = await apiClient.put<MessageResponse>(
          `${servicePath}/users/${this.id}`,
          { currentPassword, newPassword },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );

        if (response.status === 200) {
          return {
            isSuccess: true,
            message: response.data.message || 'Password changed successfully',
          };
        }
      } catch (error) {
        const status = getErrorStatus(error);

        if (status === 401) {
          return {
            isSuccess: false,
            message: getErrorMessage(error, 'Unauthorized'),
          };
        }

        if (status === 422) {
          return {
            isSuccess: false,
            message: getErrorMessage(error, 'Validation error'),
            errorDetails: getErrorDetails(error),
          };
        }

        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Error changing password'),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Delete the user account
     * @returns
     */
    async deleteAccount(): Promise<ApiResult> {
      try {
        const response = await apiClient.delete(`${servicePath}/users/${this.id}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response.status === 204) {
          return {
            isSuccess: true,
          };
        }
      } catch (error) {
        if (getErrorStatus(error) === 401) {
          return {
            isSuccess: false,
            message: getErrorMessage(error, 'Unauthorized'),
          };
        }

        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Error deleting user account'),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Logout the user
     */
    logout(): Promise<void> {
      this.$reset();
      localStorage.clear();
      return Promise.resolve();
    },
    /**
     * @description Login the user
     * @param userName
     * @param password
     * @returns
     */

    async login(userName: string, password: string): Promise<loginData> {
      try {
        const response = await apiClient<LoginResponse>({
          method: 'post',
          url: `${servicePath}/login`,
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            userName,
            password,
          },
        });

        if (response.status === 200) {
          const { token, user } = response.data;
          await setAuthData(
            token,
            user.userName,
            user.id,
            user.timezone ?? 'UTC',
            user.emailConfirmed,
          );
          return {
            isSuccess: true,
            message: response.data.message || 'Login successful',
          };
        }
        // Any non-200 success status is treated as a failed login.
        return {
          isSuccess: false,
          message: response.data.message || 'Login failed',
        };
      } catch (error) {
        const status = getErrorStatus(error);

        if (status === 401) {
          return {
            isSuccess: false,
            message: getErrorMessage(error, 'Invalid credentials'),
          };
        }

        if (status === 422) {
          return {
            isSuccess: false,
            message: getErrorMessage(error, 'Validation error'),
          };
        }

        // Network/CORS errors have no response; still return a result object
        // so callers can safely destructure it.
        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Login failed. Please try again.'),
        };
      }
    },
    /**
     * @description Initialize the store from the local storage
     */
    async initializeFromLocalStorage(): Promise<void> {
      this.token = localStorage.getItem('token') || null;
      this.userName = localStorage.getItem('userName') || null;
      this.id = localStorage.getItem('id') || null;
      this.timezone = localStorage.getItem('timezone') || 'UTC';
      this.emailConfirmed = localStorage.getItem('emailConfirmed') === 'true' || false;
    },
    /**
     * @description Check if the token is valid
     */
    async checkAndValidateToken(): Promise<boolean> {
      if (!this.token) {
        return false;
      }

      const response = apiClient({
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
        .catch(() => false);

      return response;
    },
    /**
     * @description Confirm the user's email
     * @param email
     * @param token
     * @returns
     */
    async confirmEmail(email: string, token: string): Promise<boolean> {
      const response = apiClient({
        method: 'post',
        url: `${servicePath}/verify-email-confirmation-token`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email,
          token,
        },
      })
        .then((response) => {
          return response.status === 200;
        })
        .catch(() => false);

      return response;
    },
    /**
     * @description Resend the email confirmation
     * @returns
     */
    async resendEmailConfirmation(): Promise<ApiResult> {
      if (!this.token) {
        return { isSuccess: false };
      }

      try {
        const response = await apiClient({
          method: 'post',
          url: `${servicePath}/resend-email-confirmation`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response.status === 200) {
          return { isSuccess: true };
        }
      } catch (error) {
        // Only report the result; the calling page owns the notification so a
        // failure shows a single error toast, not one here and one there.
        const status = getErrorStatus(error);

        if (status === 535) {
          return {
            isSuccess: false,
            message: getErrorMessage(
              error,
              'Email server authentication failed. Please contact support.',
            ),
          };
        }

        return {
          isSuccess: false,
          message: getErrorMessage(error, 'Unable to resend email confirmation. Please try again.'),
        };
      }

      return { isSuccess: false };
    },
    /**
     * @description Request a password reset
     * @param email
     * @returns
     */
    async requestPasswordReset(email: string): Promise<boolean> {
      const response = apiClient({
        method: 'post',
        url: `${servicePath}/request-password-reset`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email,
        },
      })
        .then((response) => {
          return response.status === 200;
        })
        .catch(() => false);

      return response;
    },
    /**
     * @description Verify the password reset token
     * @param email
     * @param token
     * @returns
     */
    async verifyPasswordResetToken(email: string, token: string): Promise<boolean> {
      const response = apiClient({
        method: 'post',
        url: `${servicePath}/verify-password-reset-token`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email,
          token,
        },
      })
        .then((response) => {
          return response.status === 200;
        })
        .catch(() => false);

      return response;
    },
    /**
     * @description Reset the password
     * @param email
     * @param token
     * @param newPassword
     * @returns
     */
    async passwordReset(email: string, token: string, newPassword: string): Promise<boolean> {
      const response = apiClient({
        method: 'post',
        url: `${servicePath}/password-reset`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email,
          token,
          newPassword,
        },
      })
        .then((response) => {
          return response.status === 200;
        })
        .catch(() => false);

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
