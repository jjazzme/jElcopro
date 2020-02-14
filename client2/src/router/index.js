import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home'
import Producers from '@/components/Producers'
import Documentes from '@/components/Documents'
import Document from '@/components/Document'
import Product from '@/components/Product'
import Offer from '@/components/Offer'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
    {
        path: '/offer',
        name: 'offers',
        component: Offer,
    },
  {
    path: '/producer',
    name: 'producers',
    component: Producers,
  },
  {
    path: '/product/:id',
    name: 'product',
    component: Product,
  },
  {
    path: '/document/:type/:id',
    name: 'document',
    component: Document,
  },
  {
      path: '/documents/:type',
      name: 'documents',
      component: Documentes,
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
