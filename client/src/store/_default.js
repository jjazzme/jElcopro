import Vue from 'vue';
import Vuex from 'vuex';

import tables from './tables'
import auth from './auth'
import env from './env'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  getters : {},
  modules:{
    TABLES: tables,
    AUTH: auth,
    ENV: env,
  }
});
