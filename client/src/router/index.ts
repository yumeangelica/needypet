import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
// import TabsPage from '@/pages/TabsPage.vue'
import PageHome from '@/pages/PageHome.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: PageHome
  },
  // {
  //   path: '/tabs/',
  //   component: TabsPage,
  //   children: [
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
  // smoothScroll: true
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
  }
})

export default router
