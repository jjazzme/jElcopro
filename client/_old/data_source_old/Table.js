'use strict';

import crypto from "crypto";
import _ from "lodash";
import Vue from "vue";
import Optics from "./Optics";
import Shells from "./Shells";
import Basket from "./Basket"


//import {Basket, Data, Optics, Shells} from "../old/TableSource";

export default class Table{
  constructor(type, optics, debounceAmount, store){
    this.debounceAmount = debounceAmount;
    this.type = type;
    this.optics = new Optics(optics);
    this.shells = new Shells(type);
    this.basket = new Basket();
    this.data = new Data(type);
    this.htmlObject = null;
    this.htmlHeader = null;
    this.drag = {before:0, column:null, from:0, startObjWidth:0, startX: 0, action: null};
    this.iOptics = { filters: {}, sorters: {} };
    this.dbId = 0;
    this.tableRenderPoint = null; // время рендеринга
    //this.queryOptics = '';

    const checked = JSON.stringify({
      shells: JSON.stringify(this.shells.template, function(key, value) {
        if (typeof value === 'function') {
          return value.toString();
        } else {
          return value;
        }
      }),
      optics: JSON.stringify((new Optics({})).value),
      sorter: JSON.stringify(this.optics.initialSorter)
    });
    this.version =   crypto.createHash('md5')
      .update(checked)
      .digest('hex');

    // собираем начальные сортеры и фильтры в оптик
    _.forEach(this.shells.value, (val, key) => { //<-------
      //k1 - columnName
      //v1 - column properties
      // eslint-disable-next-line no-constant-condition
      if(val.sortable===true){
        this.iOptics.sorters[key] = _.cloneDeep(this.optics.initialSorter);
      }
      if(val.filters && !_.isEmpty(val.filters)){
        this.iOptics.filters[key] = _.cloneDeep(val.filters);
      }
    });

    let isDifferentVersions = false;
    store.dispatch('Binder/getItem', { type: 'Shell', payload: { type: type, version: this.version} })
      .then(ans=>{
        if(ans && ans.version === this.version) {
          Vue.set(this, 'dbId', ans.id);
          Vue.set(this.basket, 'value', ans.basket);
          Vue.set(this.shells, 'value', ans.columns);
          Vue.set(this.optics, 'value', ans.optics);
          _.forEach(this.basket.value, id => {
            store.dispatch('LOADER/getItem', { type: this.type, payload: { id: id } } )
              .then(ins=>
                this.data.basket.push(ins))
          });
        } else {
          this.reset();
          if(ans && ans.version !== this.version) {
            isDifferentVersions = true;
            Vue.set(this, 'dbId', ans.id);
          }
        }

        // мержим оптику из query
        const opticsBeforeMerge = _.cloneDeep(this.optics.value);
        this.optics.merge(optics.value);
        this.shells.assembled = Date.now();

        //if (this.dbId===0 || isDifferentVersions || !_.isEqual(this.optics.value, opticsBeforeMerge)) this.saveShell();

      })
  }

  basketChange(id){
    const bas = this.basket.value;
    const basket = this.data.basket;
    if( !bas.includes(id) ) {
      bas.push(id);
      store.dispatch('LOADER/getItem', { type: this.type, payload: { id: id } } )
        .then(ins=>
          basket.push(ins))
    }
    else {
      bas.splice(bas.indexOf(id), 1);
      basket.splice(_.findIndex(basket, item=>item.id===id), 1);
    }
  }
  calculateColumnStyles(offset){
    let temp = {};
    Object.keys(this.shells.value).map((k) => {
      let els = this.htmlObject.querySelectorAll(`div[data-column="${k}"]`);
      let height = 20;
      let width = 30;
      let paddingL = 5;
      let paddingR = 5;
      let length = 0;
      els.forEach(item=>{
        if (item.querySelector('span')?.offsetHeight>height) height = item.querySelector('span').offsetHeight;
        if (item.querySelector('span')?.offsetWidth>width) width = item.querySelector('span').offsetWidth;
        if (item.querySelector('span')?.innerText.length>length) length = item.querySelector('span').innerText.length;
        if (paddingL< parseInt(getComputedStyle(item).paddingLeft.replace('px',''))) paddingL = parseInt(getComputedStyle(item).paddingLeft.replace('px',''));
        if (paddingR< parseInt(getComputedStyle(item).paddingRight.replace('px',''))) paddingR = parseInt(getComputedStyle(item).paddingRight.replace('px',''))
      });
      temp[k]={};
      temp[k].width = width;
      temp[k].height = height;
      temp[k].length = length;
      temp[k].padding = paddingL+paddingR+2
    });
    let maxLen = 0;
    Object.keys(temp).map((k)=>{
      if (temp[k].length>maxLen) maxLen=temp[k].length
    });
    Object.keys(temp).map((k)=>{
      if (temp[k].length === maxLen) {
        Vue.set(this.shells.value[k], 'style', 'min-width: auto; max-width: 100%');
        //this.shells.value[k].style = 'min-width: auto; max-width: 100%';
      } else {
        Vue.set(this.shells.value[k], 'style', `min-width: ${temp[k].width + temp[k].padding + offset}px; max-width: ${temp[k].width + temp[k].padding + offset}px;`);
        //this.shells.value[k].style = `min-width: ${temp[k].width + temp[k].padding}px; max-width: ${temp[k].width + temp[k].padding}px;`;
      }
    });
  }
  get columnsOptionsChanged(){
    let ret = {};
    _.forEach(this.shells.value, (val, key)=>{
      if (!val.hidden) ret[key] =
        !_.isEqual(this.iOptics.filters[key], this.optics.value.filters[key])
        || !_.isEqual(this.iOptics.sorters[key], this.optics.value.sorters[key]);
    });
    return ret;
  }
  get Name() { return this.shells.template[this.type].name }
  get queryOptics() {
    return this.zipup(this.optics.value);
  }
  loadData(){
    // получаем данные
    let payload = this.saveShellPayload;
    this.data.loadDataByOptics(this.type, this.optics.value, this.shells.params)
      .then(ans=>{
        Vue.set(this.optics.value, 'items', ans._rows);
        payload.optics.items = ans.rows;
        //this.saveShell(payload);
      });
  }
  reset() {
    this.optics.value.sorters = _.cloneDeep(this.iOptics.sorters);
    this.optics.value.filters = _.cloneDeep(this.iOptics.filters);
  }
  setRowWidth(){
    let width = 70;
    Object.keys(this.shells.value).map((k) => {
      width += this.htmlHeader.querySelector(`div[data-column="${k}"]`).offsetWidth;
    });
    Vue.set(this.shells, 'width', width);
  }
  saveShell(payload){
    if (!payload) payload = this.saveShellPayload;
    store.dispatch('LOADER/saveItem', { type: 'Shell', payload: payload })
      .then(ins=>{
        if (ins.id !== this.dbId) this.dbId = ins.id;
      });
  }
  get saveShellPayload () { return _.cloneDeep( { id: this.dbId, type: this.type, version: this.version, basket: this.basket.value, columns: this.shells.value, optics: this.optics.value } ) }
  get style() {
    let ret = {};
    Object.keys(this.shells.value).map((k)=>{
      ret[k] = `order: ${this.shells.value[k].order}; ${this.shells.value[k].style}`
    });
    return ret;
  }
  tableOptimization(offset){
    //оптимизация визуализации талицы
    this.shells.width = 0;
    this.calculateColumnStyles(offset);
  }
  tableSort(col, dir){
    this.optics.value.sorters[col].value = dir;
    if (dir===null) {
      this.optics.value.sorters[col].order = null;
    } else {
      if (this.optics.value.sorters[col].order === null) {
        this.optics.value.sorters[col].order = 100;
      }
    }
    let order = [];

    Object.keys(this.optics.value.sorters).map((k)=>{
      if(this.optics.value.sorters[k].order!==null) order.push({old: this.optics.value.sorters[k].order, new:0})
    });
    order.sort((a,b)=>{
      if(a.old>b.old) {return 1}
      if(a.old<b.old) {return -1}
      return 0
    });

    order.forEach((f,i)=>{f.new=i+1});
    Object.keys(this.optics.value.sorters).map((k)=>{
      if(this.optics.value.sorters[k].order!==null) {
        const fO = order.find(e=>{return e.old===this.optics.value.sorters[k].order})
        this.optics.value.sorters[k].order = fO.new;
      }
    });
  }
  zipup(obj){
    obj = _.cloneDeep(obj);
    if (_.isArray(obj)) {
      _.remove(obj, (item)=>{
        return item.value === null || item.value==='' || (_.isObject(item.value) &&_.isEmpty(item.value))
      });

      obj.forEach((item)=>{
        if (_.isObject(item) || _.isArray(item)) {
          item = this.zipup(item)
        }
      });
    } else if (_.isObject(obj)) {

      Object.keys(obj).map((k)=>{
        if (k.charAt(0)==='_'){
          delete obj[k];
        } else if (_.isArray(obj[k])) {
          obj[k] = this.zipup(obj[k])
          if(obj[k].length===0) delete obj[k];
        } else if (_.isObject(obj[k])) {
          if(obj[k].value==='' || (_.isObject(obj[k].value) &&_.isEmpty(obj[k].value))) {
            delete obj[k];
          } else {
            obj[k] = this.zipup(obj[k])
            if(_.isEmpty(obj[k])) delete obj[k];
          }
        } else {
          if (!obj[k]){
            delete obj[k];
          }
        }
      });
    }
    return obj
  }
}