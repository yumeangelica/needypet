import { defineStore } from 'pinia';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

export const useAppStore = defineStore('app', {
  state: () => ({
    isMobile: false,
    notifications: [] as Notification[],
  }),
  actions: {
    updateScreenSize(width: number) {
      this.isMobile = width < 768;
    },
    watchScreenSize() {
      this.updateScreenSize(window.innerWidth);

      const resizeHandler = () => {
        this.updateScreenSize(window.innerWidth);
      };

      window.addEventListener('resize', resizeHandler);

      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
    },
    async getTimezones() {
      const data = Intl.supportedValuesOf('timeZone');
      return data;
    },
    addNotification(
      message: string,
      type: 'success' | 'error' | 'info',
      duration = 5000
    ) {
      const id = Date.now();
      const newNotification: Notification = {
        id,
        timestamp: Date.now(),
        message,
        type,
      };
      // If new is same as last, don't add
      if (
        this.notifications.length &&
        this.notifications[this.notifications.length - 1].message ===
          newNotification.message &&
        this.notifications[this.notifications.length - 1].type ===
          newNotification.type
      ) {
        return;
      }
      this.notifications.push(newNotification);

      // Auto-remove notification after duration
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    },
    removeNotification(id: number) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },
  },
});
