import Vue from     'vue';
import Vuex from    'vuex';

import User from './User';
import Binder from  './Binder';
import Env from     './Env';

//import tables from './tables'
//import Cards from './Cards';


Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  getters : {},
  modules:{
    User: User,
    Binder: Binder,
    Env: Env,

    //TABLES: tables,
    //CARDS: cards,
    //LOADER: loader,
  }
});
