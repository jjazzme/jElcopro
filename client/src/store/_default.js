import Vue from 'vue';
import Vuex from 'vuex';

import tables from './tables'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  getters : {},
  modules:{
    TABLES: tables,
  }
});
