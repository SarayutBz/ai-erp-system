import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'DashboardPage',
    //   component: DashboardPage,
    // },
    { path: '/', component: () => import('../pages/DashboardPage.vue') },
    { path: '/orders', component: () => import('../pages/OrderPage.vue') },
    { path: '/upload', component: () => import('../pages/UploadPage.vue') },
    { path: '/logs', component: () => import('../pages/LogsPage.vue') },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

export default router
