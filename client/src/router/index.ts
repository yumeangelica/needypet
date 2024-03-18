import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/PageHome.vue'),
    alias: '/pets'
  },
  {
    path: '/pets/:id',
    name: 'pet',
    component: () => import('@/pages/PagePet.vue'),
    props: true
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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
