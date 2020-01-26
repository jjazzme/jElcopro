import Vue from 'vue';
import Vuex from 'vuex';
import producer from './producer';
import snackbar from './snacbar'
import invoice from '@/store/invoice';
import order from '@/store/order';
import breadcrumbs from '@/store/breadcrumbs';
import documentLine from '@/store/documentLine';
import transitions from '@/store/transitions';
import user from '@/store/user';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
      INVOICE: invoice,
      ORDER: order,
      PRODUCER: producer,
      SNACKBAR: snackbar,
      BREADCRUMBS: breadcrumbs,
      DOCUMENTLINE: documentLine,
      TRANSITIONS: transitions,
      USER: user,
  }
})
