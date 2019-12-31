'use strict';
import _ from "lodash";
import Vue from "vue";

export class Optics {
  constructor(optics){ // {page, sorters, filters, items, limit}
    this.value = optics;
    //{page: page ?? 1, sorters: sorters ?? {}, filters: filters ?? {}, items: items ?? [], limit: limit ?? 15};
  }

  get initialSorter() { return Object.freeze({order:null, value:null}) }
  merge(value){
    _.forEach(value, (val, key)=>{
      if (this[key] !== undefined) Vue.set(this, key, val);
    });
  }
}