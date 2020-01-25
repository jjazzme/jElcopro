import Vue from 'vue';
import Vuex from 'vuex';
import producer from './producer';
import snackbar from './snacbar'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
      PRODUCER: producer,
      SNACKBAR: snackbar,
  }
})
