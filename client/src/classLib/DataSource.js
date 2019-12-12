'use strict';

import _ from "lodash";
import Shells from "./DataSource/Shells";
import PriceList from "./DataSource/PriceList";

export default class DataSource{
  constructor(store){
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
          .then(resp=> {
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

