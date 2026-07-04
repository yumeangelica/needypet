import type { Router } from 'vue-router';

const publicRouteNames = ['login', 'register', 'landing', 'confirm', 'request-password-reset'];

interface SessionState {
  token: string | null;
}

export const isPublicRouteName = (name: unknown): boolean =>
  typeof name === 'string' && publicRouteNames.includes(name);

export const installAuthGuard = (router: Router, session: SessionState): void => {
  router.beforeEach((to) => {
    if (isPublicRouteName(to.name) || session.token) {
      return true;
    }

    return { name: 'landing' };
  });
};
