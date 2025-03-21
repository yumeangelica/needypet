import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/pages/PageLanding.vue'),
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/pages/PageHome.vue'),
    alias: '/pets',
  },
  {
    path: '/pets/:id',
    name: 'pet',
    component: () => import('@/pages/PagePet.vue'),
    props: true,
    children: [
      {
        path: 'edit',
        name: 'edit-pet',
        component: () => import('@/pages/PageEditPet.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/add-pet',
    name: 'add-pet',
    component: () => import('@/pages/PageAddPet.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/PageProfile.vue'),
  },
  {
    path: '/edit-profile',
    name: 'edit-profile',
    component: () => import('@/pages/PageEditProfile.vue'),
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: () => import('@/pages/PageChangePassword.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/PageRegister.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/PageLogin.vue'),
  },
  {
    path: '/request-password-reset',
    name: 'request-password-reset',
    component: () => import('@/pages/PageRequestPasswordReset.vue'),
  },
  {
    path: '/confirm',
    name: 'confirm',
    component: () => import('@/pages/PageConfirm.vue'),
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

// // Save the current path to the session storage
router.beforeEach((to, _, next) => {
  sessionStorage.setItem('currentPath', to.fullPath);
  next();
});

export default router;
