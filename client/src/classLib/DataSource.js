'use strict';

import _ from "lodash";
import Shells from "./DataSource/Shells";
import PriceList from "./DataSource/PriceList";
import axios from "axios";
import Error from "./Error";

export default class DataSource{
  constructor(store){

    /// for axios
    this.axiosID = 0;
    axios.interceptors.response.use(function (ans) {
      const uid = ans.config._uid;
      store.commit('Binder/removeRequest', uid);
      return ans;
    }, function (error) {
      if (error.config){
        const uid = error.config._uid;
        store.commit('Binder/removeRequest', uid);
      }
      const err = new Error({ error });
      return err.process(err.types.axios); //return Promise.reject(error);
    });
    axios.interceptors.request.use(function (config) {
      const url = config.url;
      const isLocalRequest = url.startsWith('/api/');
      const type = config._type;

      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      config.cancelToken= source.token;

      const ticket = JSON.parse(localStorage.getItem('ticket'));
      if (isLocalRequest && ticket && ticket.expires_in > Date.now()) config.headers.Authorization = `${ticket.token_type} ${ticket.access_token}`;
      store.commit('Binder/incAxiosID');
      const uid = store.getters['Binder/getAxiosID'];  //`f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
      config._uid = uid;
      const eid = config.headers._eid; //config.data.optics ? config.data.optics._eid : null;

      store.commit('Binder/addRequest', { uid, source, url, type, eid });
      return config;
    }, function (error) {
      const err = new Error({ error });
      return err.process(err.types.axios); //return Promise.reject(error);
    });

    this.user = null;

    this.shells = new Shells();
    this.store = store;
    this.priceList = new PriceList({
      search:'max', quantity:5, fromQuantity:false, onlyDB: true,
      depth:10, pages:1, debounceAmount:1000, minSearchLenSensitivity:4
    });

    // after all classes
    this.refsOrder = [
      {
        type: 'Store',
        targets: [(val) => { this.priceList.references.stores = val }],
        errorAddText: 'складов',
        after: [
          {
            type: 'Currency',
            targets: [(val) => { this.priceList.references.currencies = val }],
            errorAddText: 'валют',
            after: [
              {
                type: 'CurrencyRateService',
                targets: [(val) => { this.priceList.references.currencyRates = val }],
                errorAddText: 'курсов валют'
              },
            ]},
        ]},
    ];
    const refLoader = (refs) => {
      _.forEach(refs, item=>{
        this.loadTableByType(item.type)
          .then(()=> {
            _.forEach(item.targets, target => {
              const table = this.getTableByType(item.type);
              target(table);
              if (item.type === 'Store') {
                let selectedStores = table.map(store=>{ if(!store.online) return store.id }).filter(id => id);
                this.priceList.selectedStores = selectedStores;
              }
            });
          })
          .catch(err=>{
            console.log(err);
          })
          .finally(()=>{
            // последовательность
            if(item.after) refLoader(item.after)
          });
      });
    };
    refLoader(this.refsOrder);
  }

  getSourceByOptics({ type, optics }){
    const params = this.shells.value[type].controller;
    return this.store.dispatch('Binder/getByOptics', { type, payload: { optics, params } })
  }
  getTableByType(type){
    return this.store.getters['Binder/getCacheTableByType'](type);
  }
  loadTableByType(type){
    const optics = { pageSize: -1, page: 1 }
    return this.getSourceByOptics({ type, optics })
  }
}

