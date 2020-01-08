'use strict';

import $store from "../../../store/_index";
import _ from "lodash";

export default class PriceLoadProcessor{
  constructor(){
    this.type = 'PriceList';
    this.previousOptics = null;
    this.eid = null;
    this.eids = [];
    this.data = null;
    this.stores = null;
    this.currency = null;
    this.currencyRates = null;
    this.updateID = 0;
  }

  getSource(optics) {

    if (_.isEqual(this.previousOptics, optics)) return;

    this.data = { count: 0, filteredCount: 0, rows: [] };
    this.loadPrice(0, optics)
      .then(ans => {

      });

    if(!optics.onlyDB)
    {
      _.forEach(optics.from_store_ids, storeID=>{
        if(_.find(this.stores,store => store.id === storeID).online){
          let StoreOptics = {name: optics.name, from_store:storeID};
          this.loadPrice(storeID, StoreOptics)
            .then(ans => {

            });
        }
      });
    }

    this.previousOptics = _.cloneDeep(optics);
  }

  loadPrice(store, optics){
    if (_.isInteger(store) && store !== 0) store = this.getStoreById(store);
    this.cancelAxiosByStoreId(store.id);

    const eid = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
    if (store === 0) {
      this.eid = eid;
    } else {
      this.eids.push({ id: store.id, eid })
    }
    const ret = $store.dispatch('Binder/getByOptics', { type: this.type, payload: { optics, eid } });
    ret
      .then(response=> {
        if (!response) return;
        // агрегируем
        _.forEach(response.data, row => {
          if (row.id === 0) {
            this.data.rows.push(row);
            this.data.count++
          } else {
            const ind = _.findIndex(this.data.rows, (item) => item.id === row.id);
            if (ind < 0) {
              this.data.rows.push(row);
              this.data.count++;
            } else {
              const item = this.data.rows[ind];
              if (Date.parse(row.actual) > Date.parse(item.actual)) {
                this.data.rows.splice(ind, 1, row)
              }
            }
          }
        });
        // для перерисовки
        this.updateID++;
      })
      .finally(() => {
        if (store === 0) this.eid = null;
        else {
          const ind = _.findIndex(this.eids, item => item.eid === eid);
          this.eids.splice( ind , 1);
        }
      });
    return ret;
  }

  displayedSelection(optics){
    if (!this.data || this.data.rows.length === 0) return null;

    // обрубаем неприменимое (если УЧИТЫВАТЬ КОЛ-ВО)
    const minBallance = optics.fromQuantity ? optics.quantity : 1;
    let ret = optics.fromQuantity
      ? _.filter(this.data.rows, row=>row.ballance>=minBallance && row.ballance>=row.min)
      : _.clone(this.data.rows);

    // обрезаем вывод если чекрыжек по актуальности
    if (optics.fromRelevance) ret = _.filter(ret, row=>Math.abs(Date.now() - new Date(row.actual)) / 36e5 <= optics.relevance);

    const limit = optics.depth*optics.pages;
    const offset = optics.offset || 0;

    const rates = this.currencyRates;
    const cures = this.currency;

    //считаем рубли и суммы
    _.forEach(ret, (row)=>{
      let rur = row.currency_id==='R01000'
        ? row.our_price
        : row.currency_id==='R01235'
          ? row.our_price*_.find(rates, item => item.currency_id === "R01235").rate
          : row.our_price * _.find(rates, item => item.currency_id === row.currency_id).rate / _.find(cures, item => item.id === row.currency_id).nominal;

      const v1 = optics.quantity<row.min ? row.min : optics.quantity;
      const v2 = v1 % row.multiply ? row.multiply + v1 - (v1 % row.multiply) : v1;
      row._realCount = row.max > v2 ? v2 : row.max;

      row._priceRUR = rur;
      row._sumRUR = rur * row._realCount;

    });

    // обрезаем вывод если чекрыжек по количеству
    if (optics.fromQuantity) ret = _.filter(ret, row => row._realCount >= optics.quantity);

    this.data.filteredCount = ret.length;
    // сортировка и обрезка
    ret = (optics.fromQuantity ? _.sortBy(ret, ['_sumRUR']) : _.sortBy(ret, ['_realCount', '_priceRUR'], ['desc','asc']) )
      .slice(offset, limit);

    // валютные суммы
    _.forEach(ret, (row)=>{
      let usd = row.currency_id==='R01235'
        ? row.our_price
        : row.currency_id==='R01000'
          ? row.our_price/_.find(rates, item=>item.currency_id==="R01235").rate
          : row._priceRUR / _.find(rates, item => item.currency_id === "R01235").rate;


      row._priceUSD = usd;
      row._sumUSD = usd * row._realCount;
      row._relevance = optics.relevance;
    });

    // для генерации кеев в-форов
    this.data.priceKey = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
    return ret
  }

  getStoreById(id){return _.find(this.stores, store => store.id === id);}
  cancelAxiosByStoreId(id){
    let eid = null;
    if (id === 0) {
      if (!this.eid) return;
      eid = this.eid;
      this.eid = null;
    } else {
      const _eid = _.findLast(this.eids, store => store.id === id);
      if (!_eid) return;
      eid = _eid.eid;
      this.eids.splice( _.findIndex(this.eids, item => item.eid === eid) , 1);
    }
    const request = $store.getters['Binder/getRequestByEid'](eid);
    request.source.cancel('aborted');
    $store.commit('Binder/removeRequest', request.uid);
  }
}