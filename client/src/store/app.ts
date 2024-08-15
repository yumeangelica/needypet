import { defineStore } from 'pinia';

/**
 * @description App store application definition
 */
export const useAppStore = defineStore('app', {
  state: () => ({
    isMobile: false,
  }),
  actions: {
    async updateScreenSize(width: number) {
      this.isMobile = width < 425.1;
    },
    /**
     * @description Get timezones
     * @returns {Promise<string[]>} timezones
     */
    async getTimezones() {
      const data = Intl.supportedValuesOf('timeZone');
      return data;
    },
  },
});
