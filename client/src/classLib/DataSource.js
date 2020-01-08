'use strict';

import _ from "lodash";
import Shells from "./DataSource/Shells";
//import PriceList from "./DataSource/PriceList";
//import Tables from "./DataSource/Tables";
import axios from "axios";
import Error from "./Error";
import {Basket} from "./DataSource/Basket";
import {Optics} from "./DataSource/Optics";

export default class DataSource{
  refsOrder = [
    {
      type: 'Store',
      //targets: [(val) => { this.priceList.references.stores = val }],
      errorAddText: 'складов',
      after: [
        {
          type: 'Currency',
          //targets: [(val) => { this.priceList.references.currencies = val }],
          errorAddText: 'валют',
          after: [
            {
              type: 'CurrencyRateService',
              //targets: [(val) => { this.priceList.references.currencyRates = val }],
              errorAddText: 'курсов валют'
            },
          ]},
      ]},
  ];
  constructor(store, optics, classSourceActualTTL, debounceAmount){
    this.type = null;
    this.store = store;
    this.debounceAmount = debounceAmount ?? 1000;
    this.tables = {};
    this.initialOptics = this.getOpticsObject(optics);

    this.classSourceActualTTL = classSourceActualTTL;

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
    this.userFormed = false;

    this.shells = new Shells(20);
    _.forEach(this.shells.template, (val, type) => {
      this.tables[type] = { basket: new Basket(), optics: new Optics(val.optics || {}), loadProcessor: val.loadProcessor };
    });
    //this.tables.PriceList.loadProcessor.getStoreById = this.getStoreById;
  }

  cancelAxiosByEid(eid) {
    // eid = null - maim from eid
    // else - additional fom [] eids
    const _eid = eid || this.getTable.loadProcessor.eid;
    const request = this.store.getters['Binder/getRequestByEid'](_eid);
    request.source.cancel('aborted');
    if (eid) this.getTable.loadProcessor.eid = null;
    else this.getTable.loadProcessor.eids.slice( _.findIndex(this.getTable.loadProcessor.eids, store => store.eid === _eid) , 1);
    this.store.commit('Binder/removeRequest', request.uid);
  }
  cancelAxiosByStoreID(id){

  }
  get getBackSensitiveOptics(){
    const getBS = this.getShell.getBackSensitive;
    return getBS ? getBS(this.getTable.optics.value) : this.getTable.optics.value;
  }
  get getInvoice(){
    return this.user.cards.invoice ? this.getSourceById({ type: 'Invoice', id: this.user.cards.invoice }) : null;
  }
  get getOrders(){
    return this.user.cards.orders.map(id => {
      return this.getSourceById({ type: 'Order', id })
    })
  }
  get initialCards(){
    this.user.cards.invoice
  }
  getQueryOpticsByType(type){
    return this.tables[type] ? JSON.stringify(this.tables[type].optics.value) : null;
  }
  getOpticsObject(val){
    if (typeof val === "object") {
      return val;
    }
    try {
      const ret = JSON.parse(val);
      return ret;
    } catch (error) {
      return null;
    }
  }
  getSourceById({ type, id }){
    return this.store.dispatch('Binder/getItem', { type, payload: { id } })
  }
  getSourceByOptics({ type, optics }){
    if (optics) this.tables[type].optics.value = optics;
    if (!optics) optics = this.tables[type].optics.value;
    const params = this.shells.template[type].controller;
    const ret = this.store.dispatch('Binder/getByOptics', { type, payload: { optics, params, type } });
    ret
      .then(ans => {
        if (Array.isArray(ans)) this.tables[type].data = ans;
        else this.tables[type].data = ans.rows;
      });
    return ret;
  }
  get getShell(){
    return this.shells.template[this.type];
  }
  get getTable(){
    return this.tables[this.type];
  }
  get isStoresLoaded(){
    return this.tables?.Store?.data ? this.tables.Store.data.length > 0 : false;
  }
  loadReferences(){
    const refLoader = (refs) => {
      _.forEach(refs, item=>{
        this.getSourceByOptics({ type: item.type })
          .then((ans)=> {
            if (item.type === 'Store') {
              this.tables.PriceList.optics.value.selectedStores = ans.rows.map(store=>{ if(!store.online) return store.id }).filter(id => id);
              this.tables.PriceList.loadProcessor.stores = ans.rows;
            } else if (item.type === 'Currency') {
              this.tables.PriceList.loadProcessor.currency = ans.rows;
            } else if (item.type === 'CurrencyRateService') {
              this.tables.PriceList.loadProcessor.currencyRates = ans;
            }
          })
          .finally(()=>{
            // последовательность
            if(item.after) refLoader(item.after)
          });
        /*
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
         */
      });
    };
    refLoader(this.refsOrder);
  }
  loadOrders(){
    _.forEach(this.user.cards.orders, id=>{
      this.getSourceById({ type: 'Order', id })
        .finally(()=>{
          if(id === _.last(this.user.cards.orders)) this.user.cardsLoaded = true;
        })
    })
  }
  loadUser(){
    return new Promise(resolve=>{
      const loadOrders = () => {
        _.forEach(this.user.cards.orders, id => {
          this.getSourceById({type: 'Order', id})
            .finally(() => {
              if (id === _.last(this.user.cards.orders)) resolve();
            })
        });
      }

      this.store.dispatch('Auth/autoLogin')
        .then(user => {
          this.user = user;
          if (user.cards.invoice){
            this.getSourceById({ type: 'Invoice', id: user.cards.invoice })
              .finally(()=>{
                if (user.cards.orders && user.cards.orders.length>0) loadOrders();
                else resolve();
              })
          } else {
            if (user.cards.orders && user.cards.orders.length>0) loadOrders();
            else resolve();
          }
        });

    });
  }

}

