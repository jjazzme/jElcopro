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
import documentTypes from '@/store/documentTypes';
import transferIn from '@/store/transferIn';
import company from '@/store/company';
import store from '@/store/store';

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
      COMPANY: company,
      STORE: store,
      SNACKBAR: snackbar,
      BREADCRUMBS: breadcrumbs,
      DOCUMENTLINE: documentLine,
      TRANSITIONS: transitions,
      USER: user,
      DOCUMENTTYPES: documentTypes,
      'TRANSFER-IN': transferIn,
  }
})
