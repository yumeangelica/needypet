import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { installAuthGuard } from '@/router/authGuard';

const makeRouter = (token: string | null) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'landing', component: { template: '<div />' } },
      { path: '/home', name: 'home', component: { template: '<div />' } },
      { path: '/pets/:id', name: 'pet', component: { template: '<div />' } },
      { path: '/confirm', name: 'confirm', component: { template: '<div />' } },
    ],
  });

  installAuthGuard(router, { token });
  return router;
};

describe('auth guard', () => {
  it('redirects an unauthenticated protected deep link to landing', async () => {
    const router = makeRouter(null);

    await router.push('/pets/pet-1');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('landing');
  });

  it('keeps a protected deep link when the token is valid', async () => {
    const router = makeRouter('token-1');

    await router.push('/pets/pet-1');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('pet');
    expect(router.currentRoute.value.params.id).toBe('pet-1');
  });

  it('allows public routes without a token', async () => {
    const router = makeRouter(null);

    await router.push('/confirm');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('confirm');
  });
});
