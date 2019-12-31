'use strict'

import Vue from "vue";

export class Data {
  constructor(type, optics, params){
    this.type = type;
    this.optics = optics;
    this.params = params;
    Vue.set(this, 'value', null);
    this.basket = [];

    if (optics && params) this.loadDataByOptics(type, optics)
  }

  loadDataByOptics(type, optics, params){
    this.type = type;
    this.optics = optics;
    this.params = params;
    const ret = store.dispatch('LOADER/getByOptics', {type: type, payload: { optics, params } });
    ret
      .then(ans=>{
        Vue.set(this, 'value', ans);
      });
    return ret
  }
}