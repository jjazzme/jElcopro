import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App.vue';
import pageEnvironment from "@/components/body/v1/pageEnvironment";

import router from './router';
import store from './store/_default';

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.component('page-environment', pageEnvironment);

//import '@fortawesome/fontawesome-free/css/all.css';
//import '@fortawesome/fontawesome-free/js/all.js';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

window.$  = require('cash-dom');
window._ = require('lodash')

//import _ from 'lodash';
//Object.defineProperty(Vue.protoЉtype, '$_', { value: _ });


new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
