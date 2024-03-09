import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
// import TabsPage from '@/pages/TabsPage.vue'

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
    path: '/login',
    name: 'login',
    component: () => import('@/pages/PageLogin.vue'),
  },
  // Using as an example
  // {
  //   path: '/tabs/',
  //   component: TabsPage,
  //   children: [
  //     {
  //       path: '/',

  //     },
  //     {
  //       path: 'tab1',
  //       component: () => import('@/pages/Tab1Page.vue')
  //     },
  //   ]
  // }

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
