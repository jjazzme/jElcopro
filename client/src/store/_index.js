import Vue from 'vue';
import Vuex from 'vuex';

import Auth from './auth'
import Binder from "./binder";
import Env from './env'

import tables from './tables'

import cards from './cards'
//import loader from "./loader";


Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  getters : {},
  modules:{
    Auth: Auth,
    Binder: Binder,
    Env: Env,

    //TABLES: tables,

    //CARDS: cards,
    //LOADER: loader,
  }
});
