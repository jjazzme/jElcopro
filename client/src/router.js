import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/v1/Home.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: "/login",
      name: "Login",
      component: () => import('./views/v1/Login.vue'),
    },
    {
      path: '/help',
      name: 'help',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/v1/Help.vue'),
    },
    {
      path:'/tables/:table',
      name: 'tables',
      meta: {title: 'Таблицы'},
      component: () => import('./views/v1/Tables.vue'),
    },
  ],
});
