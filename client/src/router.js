import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/v1/Home.vue';
import env from './middleware/env'

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {middleware: env},
    },
    {
      path: "/login",
      name: "Login",
      component: () => import('./views/v3/Login.vue'),
      meta: {middleware: env},
    },
    {
      path: '/help',
      name: 'help',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/v3/Help.vue'),
      meta: {middleware: env},
    },
    {
      path:'/tables/:type/:id',
      name: 'modelItem',
      meta: {middleware: env},
      component: () => import('./views/v2/ModelItem.vue'),
    },
    {
      path:'/prices',
      name: 'prices',
      meta: {middleware: env},
      component: () => import('./views/v3/PriceList.vue'),
    },
    {
      path:'/tables/:type',
      name: 'tables',
      meta: {middleware: env},
      component: () => import('./views/v2/Tables.vue'),
    },
  ],
});

function nextFactory(context, middleware, index) {
  const subsequentMiddleware = middleware[index];
  if (!subsequentMiddleware) return context.next;
  return (...parameters) => {
    context.next(...parameters);
    const nextMiddleware = nextFactory(context, middleware, index + 1);
    subsequentMiddleware({ ...context, next: nextMiddleware });
  };
}

router.beforeEach((to, from, next) => {
  if (to.meta.middleware) {
    const middleware = Array.isArray(to.meta.middleware)
        ? to.meta.middleware
        : [to.meta.middleware];

    const context = {
      from,
      next,
      router,
      to,
    };
    const nextMiddleware = nextFactory(context, middleware, 1);
    return middleware[0]({ ...context, next: nextMiddleware });
  }
  return next();
});

export default router;
