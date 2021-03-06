import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/_index';

import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


import pageEnvironment from "@/components/body/pageEnvironment";
Vue.component('page-environment', pageEnvironment);

import { library } from '@fortawesome/fontawesome-svg-core';
import { //fas
  faHome, faInfoCircle, faBarcode, faHammer, faCode, faFileInvoiceDollar, faBars,
  faSortAlphaDown, faSortAlphaUpAlt, faEllipsisV, faHandHoldingUsd, faSpinner, faTimes,
  faStepBackward, faStepForward, faFileExport, faFileImport, faThumbtack, faHandPointLeft,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {faCodepen,} from '@fortawesome/free-brands-svg-icons'; //fab
import {faQuestionCircle, faHandPointRight} from '@fortawesome/free-regular-svg-icons'; //far

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(
  faHome, faInfoCircle, faBarcode, faHammer, faCode, faCodepen, faFileInvoiceDollar, faBars,
  faSortAlphaDown, faSortAlphaUpAlt, faEllipsisV, faHandHoldingUsd, faSpinner, faTimes, faQuestionCircle,
  faStepBackward, faStepForward, faFileExport, faFileImport, faThumbtack, faHandPointRight, faHandPointLeft,
  faCheck,
);
Vue.component('fa-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

window.$  = require('cash-dom');
window._ = require('lodash');

//import _ from 'lodash';
//Object.defineProperty(Vue.protoЉtype, '$_', { value: _ });
//import '@fortawesome/fontawesome-free/css/all.css';
//import '@fortawesome/fontawesome-free/js/all.js';
//import animateCss from 'animate.css'
//Vue.use(animateCss);
//import fontsawesome from '@fortawesome/fontawesome-free'


new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

/*

 C:\Users\jazz\PhpstormProjects\jElcopro\client\node_modules\@vue\cli-service\lib\config\dev.js
       webpackConfig
        .devtool('cheap-module-eval-source-map')
        //.devtool('source-map')

 */