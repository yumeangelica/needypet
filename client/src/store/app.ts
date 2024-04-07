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
     * @description Get timezones from moment-timezone
     * @returns {Promise<string[]>} timezones
     */
    async getTimezones() {
      const data = await import('moment-timezone/data/meta/latest.json');
      return Object.keys(data.zones)
        .map((key) => data.zones[key].name)
        .sort((a: string, b: string) =>
          a.split('/')[0].localeCompare(b.split('/')[0])
        );
    },
  },
});
