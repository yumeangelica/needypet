import { defineStore } from 'pinia';

/**
 * @description App store application definition
 */
export const useAppStore = defineStore('app', {
  state: () => ({
    isMobile: false,
  }),
  actions: {
    updateScreenSize(width: number) {
      this.isMobile = width < 425.1;
    },
    /**
     * @description Start watching screen size changes
     */
    watchScreenSize() {
      // Initial check
      this.updateScreenSize(window.innerWidth);

      // Listener for screen resize
      const resizeHandler = () => {
        this.updateScreenSize(window.innerWidth);
      };

      window.addEventListener('resize', resizeHandler);

      // Return a cleanup function to remove the event listener
      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
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
