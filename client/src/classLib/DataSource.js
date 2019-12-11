'use strict';

import _ from "lodash";
import Shells from "./DataSource/Shells";
import PriceList from "./DataSource/PriceList";

export default class DataSource{
  constructor(store){
    this.shells = new Shells();
    this.store = store;
    this.PriceList = new PriceList({
      search:'max', quantity:5, fromQuantity:false, onlyDB: true, selectedStores:[1,2],
      depth:10, pages:1, debounceAmount:1000, minSearchLenSensitivity:4
    });


    // after all classes
    this.refsOrder = [
      {
        type: 'Store',
        targets: [(val) => { this.PriceList.references.stores = val }],
        errorAddText: 'складов',
        after: [
          {
            type: 'Currency',
            targets: [(val) => { this.PriceList.references.currencies = val }],
            errorAddText: 'валют',
            after: [
              {
                type: 'CurrencyRateService',
                targets: [(val) => { this.PriceList.references.currencyRates = val }],
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
              target(this.getTableByType(item.type));
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

