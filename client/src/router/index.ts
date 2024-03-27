import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/PageHome.vue'),
    alias: '/pets',
  },
  {
    path: '/pets/:id',
    name: 'pet',
    component: () => import('@/pages/PagePet.vue'),
    props: true,
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/PageProfile.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/PageLogin.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('@/pages/PageNotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Save the current path to the session storage
router.beforeEach((to, _, next) => {
  sessionStorage.setItem('currentPath', to.fullPath);
  next();
});

export default router;
