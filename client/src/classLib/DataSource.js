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
      type: 'Transition',
      errorAddText: 'переходов документа',
      getSource: () => this.getSourceById({type: 'Transition', id: 0}),
      after: [
        {
          type: 'Model',
          errorAddText: 'моделей',
        }
      ]
    },
    {
      type: 'Store',
      errorAddText: 'складов',
      after: [
        {
          type: 'Currency',
          errorAddText: 'валют',
          after: [
            {
              type: 'CurrencyRateService',
              errorAddText: 'курсов валют'
            },
          ]},
      ]
    },
  ];
  constructor(store, optics, classSourceActualTTL, debounceAmount){
    this.editor = {
      component: null,
      name: null,
      initiator: null,
      top: 10,
      left: 10,
    };
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
  cardAdd(id, type){
    //this.getSourceById({ type, id, check: ['documentLines'] });
    if (type === 'Invoice') {
      this.store.dispatch('User/invoiceAdd', id)
    } else {
      this.store.dispatch('User/orderAddRemove', id)
    }
  }
  cardDelete(id, type){
    if (type === 'Invoice') {
      this.store.dispatch('User/invoiceRemove')
    } else {
      this.store.dispatch('User/orderAddRemove', id)
    }
  }
  cardChange(doc, type){
    if (type === 'Invoice') {
      this.cardAdd(doc.id, 'Invoice');
    } else {
      const orders = this.getOrders;
      const deletedId = orders.find(row => row.sellerable_id === doc.sellerable_id).id;
      this.cardDelete(deletedId, 'Order');
      this.cardAdd(doc.id, 'Order');
    }
  }
  get getBackSensitiveOptics(){
    const getBS = this.getShell.getBackSensitive;
    return getBS ? getBS(this.getTable.optics.value) : this.getTable.optics.value;
  }
  getCacheItem(type, key){
    const cache = this.store.getters['Binder/cacheGetItem'](type, key);
    return cache ? cache[2] : null;
  }
  get getInvoice(){
    return this.user.cards.invoice ? this.store.getters['Binder/cacheGetItem']('Invoice', this.user.cards.invoice)[2] : null;
    //this.getSourceById({ type: 'Invoice', id: this.user.cards.invoice })
  }
  get getOrders(){
    return this.user.cards.orders.map(id => {
      return this.store.getters['Binder/cacheGetItem']('Order', id)[2] //this.getSourceById({ type: 'Order', id })
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
  getSourceById({ type, id, check }){
    // check - массив названий строк, необходимых для итема. Если есть итем, но нет их, то перезапросить.
    return this.store.dispatch('Binder/getItem', { type, payload: { id, check } })
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
        if(item.getSource){
          item.getSource()
            .then(ans => {
              if (item.type === 'Transition') {
                _.forEach(ans, row => {
                  const name = Object.keys(row)[0];
                  const transitions = row[Object.keys(row)[0]];
                  if(!this.shells.template[name]) this.shells.template[name] = {};

                  const statuses = [];
                  _.forEach(transitions, transition => {
                    if(!statuses.includes(transition.from)) statuses.push(transition.from)
                  });
                  if(!statuses.includes(_.last(transitions).to)) statuses.push(_.last(transitions).to);

                  _.forEach(transitions, transition => {
                    const fromInd = statuses.indexOf(transition.from);
                    const toInd = statuses.indexOf(transition.to);
                    transition.vector = toInd - fromInd;
                  });

                  const shell = this.shells.template[name];
                  shell.transition = transitions;
                })
              }
            })
            .finally(()=>{
            // последовательность
            if(item.after) refLoader(item.after)
          });
        } else {
          this.getSourceByOptics({ type: item.type })
            .then((ans)=> {
              if (item.type === 'Store') {
                this.tables.PriceList.optics.value.selectedStores = ans.rows.map(store=>{ if(!store.online) return store.id }).filter(id => id);
                this.tables.PriceList.loadProcessor.stores = ans.rows;
              } else if (item.type === 'Currency') {
                this.tables.PriceList.loadProcessor.currency = ans.rows;
              } else if (item.type === 'CurrencyRateService') {
                this.tables.PriceList.loadProcessor.currencyRates = ans;
              } else if (item.type === 'Model') {
                _.forEach(ans.rows, row => {
                  if (!this.shells.template[row.id]) this.shells.template[row.id] = {};
                  this.shells.template[row.id].Model = { perent: row.parent, children: row.children }
                });
              }
            })
            .finally(()=>{
              // последовательность
              if(item.after) refLoader(item.after)
            });
        }
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

      this.store.dispatch('User/autoLogin')
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
  runProcedure({ type, params }){
    return this.store.dispatch('Binder/runProcedure', { type, params })
  }
  updateItem({ type, item }){
    this.store.dispatch('Binder/updateItem', { type, item })
  }

}

