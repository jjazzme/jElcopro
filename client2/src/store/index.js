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
import currency from '@/store/currency';
import product from '@/store/product';
import good from '@/store/good';
import price from '@/store/price';
import currencyRate from '@/store/currencyRate';
import offer from '@/store/offer';
import transferOut from '@/store/transferOut';
import party from '@/store/party';
import address from '@/store/address';

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
      PRODUCT: product,
      GOOD: good,
      PRICE: price,
      OFFER: offer,
      COMPANY: company,
      PARTY: party,
      ADDRESS: address,
      STORE: store,
      CURRENCY: currency,
      'CURRENCY-RATE': currencyRate,
      SNACKBAR: snackbar,
      BREADCRUMBS: breadcrumbs,
      DOCUMENTLINE: documentLine,
      TRANSITIONS: transitions,
      USER: user,
      DOCUMENTTYPES: documentTypes,
      'TRANSFER-IN': transferIn,
      'TRANSFER-OUT': transferOut,
  }
})
