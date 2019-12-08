import Vue from 'vue';
import Vuex from 'vuex';

import binder from "./binder";

import tables from './tables'
import auth from './auth'
import env from './env'
import cards from './cards'
//import loader from "./loader";


Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  getters : {},
  modules:{
    Auth: auth,
    Binder: binder,

    //TABLES: tables,
    //ENV: env,
    //CARDS: cards,
    //LOADER: loader,
  }
});
