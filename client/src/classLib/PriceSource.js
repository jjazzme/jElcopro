'use strict';

export default class PriceSource{

  constructor({
      search, quantity, fromQuantity, onlyDB, selectedStores, depth, pages, debounceAmount
  }){
    this.card = {
      //add:{
      //  cell1:{alias: 'добавить', component: 'addButton', vModelComputed: 'comp'}
      //},
      one1:{
        two11:{
          online: {alias: 'тип', field:'online', html: row=>{
              return row.online
                ? "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"globe\" class=\"svg-inline--fa fa-globe fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 496 512\"><path fill=\"currentColor\" d=\"M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z\"></path></svg>"
                : "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"database\" class=\"svg-inline--fa fa-database fa-w-14\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><path fill=\"currentColor\" d=\"M448 73.143v45.714C448 159.143 347.667 192 224 192S0 159.143 0 118.857V73.143C0 32.857 100.333 0 224 0s224 32.857 224 73.143zM448 176v102.857C448 319.143 347.667 352 224 352S0 319.143 0 278.857V176c48.125 33.143 136.208 48.572 224 48.572S399.874 209.143 448 176zm0 160v102.857C448 479.143 347.667 512 224 512S0 479.143 0 438.857V336c48.125 33.143 136.208 48.572 224 48.572S399.874 369.143 448 336z\"></path></svg>"


            }},
          name: {alias:'название', field:'name', to: item=> {return {name:'goods', params:{id:item.good_id}}}},
          code: {alias: 'код', field:'code'},
          producer: {alias: 'производитель', field:'producer_name', to: item=> {return {name:'producer', params:{id:item.producer_id}}} },
          case: {alias: 'корпус', field: 'case', to: item=> {return {name:'case', params:{id:item.parameter_id}}}},
          remark: {alias: 'примечание', field: 'remark'},
        },
        two12:{
          store: {alias: 'склад', field:'store_name', to: item=> {return {name:'store', params:{id:item.store_id}}}},
          party: {alias: 'поставщик', field:'party_name', to: item=> {return {name:'company', params:{id:item.company_id}}} },
          actual: {alias: 'дата', field:'actual', html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false
              }).format(new Date(row.actual))},
          three121:{
            min:{alias: 'мин.', field:'min'},
            max:{alias: 'макс.', field:'max'},
            pack: {alias: 'упак.', field:'pack'},
            multiply: {alias: 'кратно', field:'multiply'},
          },
          three122:{
            priceUSD: {alias: 'цена $', field:'_priceUSD', _html: row=>row.convertPrice(row.our_price, row.currency_id).usd.toFixed(2)},
            sumUSD: {alias: 'сумма $', field:'_sumUSD', _html: row=>row.summPrice(row).usd.toFixed(2)},
          }
        },
      },
      one2:{
        two21:{
          ballance: {alias: 'кол-во', field:'ballance'},
          real: {alias: 'закупка', field:'_realCount', _html: row=>row.realCount(row)},
          average: {alias: 'дней', field:'average_days'},
        },
        two22:{
          priceRUR: {alias: 'цена ₽', field:'_priceRUR', _html: row=>row.convertPrice(row.our_price, row.currency_id).rur.toFixed(2)},
          sumRUR: {alias: 'сумма ₽', field:'_sumRUR', _html: row=>row.summPrice(row).rur.toFixed(2)},
          vat: {alias: 'ндс', field:'vat'},
        },
      }
    };
    this.debounceAmount = debounceAmount;
    this.depth = depth;
    this.fromQuantity = !!fromQuantity;
    this.minSearchLenSensitivity = 4;
    this.onlyDB = onlyDB;
    this.quantity = parseInt(quantity);
    this.pages = pages;
    this._price = [];
    this.priceKey = 'initial';
    this.references = {
      stores: null,
      currencies: null,
      currencyRates: null,
    };
    this.refsOrder = [
      {dispatchParam: 'Store', dataName: 'stores', errorAddText: 'складов',
        after: [
          {dispatchParam: 'Currency', dataName: 'currencies', errorAddText: 'валют',
            after: [
              {dispatchParam: 'CurrencyRate', dataName: 'currencyRates', errorAddText: 'курсов валют'},
            ]},
        ]},
    ];
    this.search = search;
    this.selectedStores = selectedStores;
    this.updateFlag = null;



    //this.optics = new Optics({search, quantity, fromQuantity, onlyDB, selectedStores, depth, pages, debounceAmount});
    //this.shell = new Shell();
    //this.data = new Data({depth, pages, quantity, fromQuantity});

    //this._quantity = parseInt(quantity);
    //this._fromQuantity = !!fromQuantity;
    //this._search = search;
    //this.onlyDB = onlyDB;
  }

  /*
  get quantity(){return this._quantity}
  set quantity(val){
    this._quantity = parseInt(val);
    this.optics.quantity = parseInt(val);
    this.data.optics.quantity = parseInt(val);
  }
  get fromQuantity(){return this._fromQuantity}
  set fromQuantity(val){
    this._fromQuantity = !!val;
    this.optics.fromQuantity = !!val;
    this.data.optics.fromQuantity = !!val;
  }
  get search(){return this._search}
  set search(val){
    this._search = val;
    this.optics.search = val;
  }
   */

  add(newRaw){
    _.forEach(newRaw, row=>{
      if(row.id === 0){
        this._price.push(row);
      } else{
        const ind = _.findIndex(this._price, function (item) {
          item.id === row.id
        });
        if (ind<0) {
          this._price.push(row);
        } else {
          if (Date.parse(row.actual)>Date.parse(item.actual)) {
            this._price.splice(ind, 1, row)
          }
        }
      }
    })
    this.updateFlag = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
  }
  get backSensitive(){
    return {name: this.search, from_store_ids: this.selectedStores}
  }
  clear(){this._price = [];}
  get count(){
    return this._price.length
  }
  set currencies(val) {this.references.currencies = val};
  set currencyRates(val) {this.references.currencyRates = val}
  get filteredCount(){
    return this._price.length
  }
  get frontSensitive(){
    return {quantity: this.quantity, fromQuantity: this.fromQuantity, depth: this.depth, pages: this.pages, updateFlag: this.updateFlag, rates: this.references.currencyRates}
  }
  getStoreById(id){
    let ret = _.find(this.references.stores, store=>store.id===id);
    return ret;
  }
  get isReferenceReceived(){
    return !_.find(this.references, item=>item === null);
  }
  nextPage(){
    this.pages++;
  }
  onePage(){
    this.pages = 1;
  }
  price(optics){
    if (this._price.length === 0) return null;
    const limit = optics.depth*optics.pages;
    const offset = optics.offset ?? 0;

    //let price = new Price(this._price, limit, offset)

    _.forEach(this._price, (row)=>{

        const rates = this.references.currencyRates;
        const cures = this.references.currency;
        let rur, usd;
        if (row.currency_id==='R01000'){
          rur = row.our_price;
          usd = row.our_price/_.find(rates, item=>item.currency_id==="R01235").rate
        } else if (row.currency_id==='R01235'){
          rur = row.our_price*_.find(rates, item=>item.currency_id==="R01235").rate;
          usd = row.our_price
        } else {
          rur = row.our_price * _.find(rates, item => item.currency_id === "R01235").rate / _.find(cures, item => item.id === row.currency_id).nominal;
          usd = rur / _.find(rates, item => item.currency_id === "R01235").rate
        }

      row._priceRUR = rur.toFixed(2);
      row._priceUSD = usd.toFixed(2);
      row._sumUSD = Date.now() % 10000 +2;
      row._sumRUR = Date.now() % 10000 + 3;
      row._realCount = Date.now() % 10000 +4;

      /*
      if (!row.convertPrice) row.convertPrice =  function(val, curID){
        const rates = this._currencyRate;
        const cures = this._currency;
        let rur, usd;
        if (row.currency_id==='R01000'){
          rur = row.our_price;
          usd = row.our_price/_.find(rates, item=>item.currency_id==="R01235").rate
        } else if (row.currency_id==='R01235'){
          rur = row.our_price*_.find(rates, item=>item.currency_id==="R01235").rate;
          usd = row.our_price
        } else {
          rur = row.our_price*_.find(rates, item=>item.currency_id==="R01235").rate/_.find(cures, item=>item.id===row.currency_id).nominal;
          usd = rur/_.find(rates, item=>item.currency_id==="R01235").rate
        }
        return {rur: rur, usd:usd};
      }.bind({_currency: this.references.currencies, _currencyRate: this.references.currencyRates});
      if (!row.realCount) row.realCount = function (row) {
        let quantity = this._optics.quantity;
        let min = row.min;
        let max = row.max;
        let multiple = row.multiply;

        let real = quantity;

        return real
      }.bind({_optics: this.optics});
      if (!row.summPrice) row.summPrice = function(row){
        return {
          rur: row.convertPrice(row.our_price, row.currency_id).rur*row.realCount(row),
          usd: row.convertPrice(row.our_price, row.currency_id).usd*row.realCount(row)
        }
      }
       */
    });

    //let ret = _.orderBy(this._price, item=>item.summPrice(item).rur);
    //this._price.sort(function (a,b) {
    //  if (a.summPrice(a) > b.summPrice(b)) return 1;
    //  if (a.summPrice(a) < b.summPrice(b)) return -1;
    //  return 0;
    //});


    let ret = this._price.slice(offset, limit);
    this.priceKey = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
    return ret
  }
  set stores(val) {this.references.stores = val}
  get stores(){
    return this.references.stores //_.sortBy(this.references.stores, item=>{return [item.company.party.name, item.name]})
  }
}

/*
class Optics{
  constructor({search, quantity, fromQuantity, onlyDB, selectedStores, depth, pages, debounceAmount}){
    this.search = search;
    this.quantity = parseInt(quantity);
    this.fromQuantity = !!fromQuantity;
    this.onlyDB = onlyDB;
    this.selectedStores = selectedStores;
    this.depth = depth;
    this.pages = pages;
    this.debounceAmount = debounceAmount;
    this.minSearchLenSensitivity = 4;
  }

  get backSensitive(){
    return {name: this.search, from_store_ids: this.selectedStores}
  }
  get frontSensitive(){
    return {quantity: this.quantity, fromQuantity: this.fromQuantity, depth: this.depth, pages: this.pages}
  }
  nextPage(){
    this.pages++;
  }
  onePage(){
    this.pages = 1;
  }
}

class Shell{
  constructor(){
    this.card = {
      //add:{
      //  cell1:{alias: 'добавить', component: 'addButton', vModelComputed: 'comp'}
      //},
      one1:{
        two11:{
          online: {alias: 'тип', field:'online', html: row=>{
              return row.online
                ? "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"globe\" class=\"svg-inline--fa fa-globe fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 496 512\"><path fill=\"currentColor\" d=\"M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z\"></path></svg>"
                : "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"database\" class=\"svg-inline--fa fa-database fa-w-14\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><path fill=\"currentColor\" d=\"M448 73.143v45.714C448 159.143 347.667 192 224 192S0 159.143 0 118.857V73.143C0 32.857 100.333 0 224 0s224 32.857 224 73.143zM448 176v102.857C448 319.143 347.667 352 224 352S0 319.143 0 278.857V176c48.125 33.143 136.208 48.572 224 48.572S399.874 209.143 448 176zm0 160v102.857C448 479.143 347.667 512 224 512S0 479.143 0 438.857V336c48.125 33.143 136.208 48.572 224 48.572S399.874 369.143 448 336z\"></path></svg>"


            }},
          name: {alias:'название', field:'name', to: item=> {return {name:'goods', params:{id:item.good_id}}}},
          code: {alias: 'код', field:'code'},
          producer: {alias: 'производитель', field:'producer_name', to: item=> {return {name:'producer', params:{id:item.producer_id}}} },
          case: {alias: 'корпус', field: 'case', to: item=> {return {name:'case', params:{id:item.parameter_id}}}},
          remark: {alias: 'примечание', field: 'remark'},
        },
        two12:{
          store: {alias: 'склад', field:'store_name', to: item=> {return {name:'store', params:{id:item.store_id}}}},
          party: {alias: 'поставщик', field:'party_name', to: item=> {return {name:'company', params:{id:item.company_id}}} },
          actual: {alias: 'дата', field:'actual', html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false
              }).format(new Date(row.actual))},
          three121:{
            min:{alias: 'мин.', field:'min'},
            max:{alias: 'макс.', field:'max'},
            pack: {alias: 'упак.', field:'pack'},
            multiply: {alias: 'кратно', field:'multiply'},
          },
          three122:{
            priceUSD: {alias: 'цена $', field:'_priceUSD', _html: row=>row.convertPrice(row.our_price, row.currency_id).usd.toFixed(2)},
            sumUSD: {alias: 'сумма $', field:'_sumUSD', _html: row=>row.summPrice(row).usd.toFixed(2)},
          }
        },
      },
      one2:{
        two21:{
          ballance: {alias: 'кол-во', field:'ballance'},
          real: {alias: 'закупка', field:'_realCount', _html: row=>row.realCount(row)},
          average: {alias: 'дней', field:'average_days'},
        },
        two22:{
          priceRUR: {alias: 'цена ₽', field:'_priceRUR', _html: row=>row.convertPrice(row.our_price, row.currency_id).rur.toFixed(2)},
          sumRUR: {alias: 'сумма ₽', field:'_sumRUR', _html: row=>row.summPrice(row).rur.toFixed(2)},
          vat: {alias: 'ндс', field:'vat'},
        },
      }
    };
  }

}

class Data{
  constructor({depth, pages, quantity, fromQuantity}) {
    this.depth = depth;
    this.pages = pages;
    this.optics = {quantity: parseInt(quantity), fromQuantity: !!fromQuantity};
    this.references = {
      stores: null,
      currencies: null,
      currencyRates: null,
    };
    this.refsOrder = [
      {dispatchParam: 'Store', dataName: 'stores', errorAddText: 'складов',
        after: [
          {dispatchParam: 'Currency', dataName: 'currencies', errorAddText: 'валют',
            after: [
              {dispatchParam: 'CurrencyRate', dataName: 'currencyRates', errorAddText: 'курсов валют'},
            ]},
        ]},
    ];
    this._price = [];
  }

  add(newRaw){
    _.forEach(newRaw, row=>{
      if(row.id === 0){
        this._price.push(row);
      } else{
        const ind = _.findIndex(this._price, function (item) {
          item.id === row.id
        });
        if (ind<0) {
          this._price.push(row);
        } else {
          if (Date.parse(row.actual)>Date.parse(item.actual)) {
            this._price.splice(ind, 1, row)
          }
        }
      }
    })
  }
  clear(){this._price = [];}
  get count(){
    return this._price.length
  }
  set currencies(val) {this.references.currencies = val};
  set currencyRates(val) {this.references.currencyRates = val}
  get filteredCount(){
    return this._price.length
  }
  price(optics){
    if (this._price.length === 0) return null;
    const limit = optics.depth*optics.pages;
    const offset = optics.offset ?? 0;

    //let price = new Price(this._price, limit, offset)

    _.forEach(this._price, (row)=>{
        row._priceRUR = Date.now() % 10000;
        row._priceUSD = Date.now() % 10000 + 1;
        row._sumUSD = Date.now() % 10000 +2;
        row._sumRUR = Date.now() % 10000 + 3;
        row._realCount = Date.now() % 10000 +4;

      //if (!row.convertPrice) row.convertPrice =  function(val, curID){
      //  const rates = this._currencyRate;
      //  const cures = this._currency;
      //  let rur, usd;
      //  if (row.currency_id==='R01000'){
      //    rur = row.our_price;
      //    usd = row.our_price/_.find(rates, item=>item.currency_id==="R01235").rate
      //  } else if (row.currency_id==='R01235'){
      //    rur = row.our_price*_.find(rates, item=>item.currency_id==="R01235").rate;
      //    usd = row.our_price
      //  } else {
      //    rur = row.our_price*_.find(rates, item=>item.currency_id==="R01235").rate/_.find(cures, item=>item.id===row.currency_id).nominal;
      //    usd = rur/_.find(rates, item=>item.currency_id==="R01235").rate
      //  }
      //  return {rur: rur, usd:usd};
      //}.bind({_currency: this.references.currencies, _currencyRate: this.references.currencyRates});
      //if (!row.realCount) row.realCount = function (row) {
      //  let quantity = this._optics.quantity;
      //  let min = row.min;
      //  let max = row.max;
      //  let multiple = row.multiply;

      //  let real = quantity;

      //  return real
      //}.bind({_optics: this.optics});
      //if (!row.summPrice) row.summPrice = function(row){
      //  return {
      //    rur: row.convertPrice(row.our_price, row.currency_id).rur*row.realCount(row),
      //    usd: row.convertPrice(row.our_price, row.currency_id).usd*row.realCount(row)
      //  }
      //}
    });

    //let ret = _.orderBy(this._price, item=>item.summPrice(item).rur);

    //this._price.sort(function (a,b) {
    //  if (a.summPrice(a) > b.summPrice(b)) return 1;
    //  if (a.summPrice(a) < b.summPrice(b)) return -1;
    //  return 0;
    //});


    let ret = this._price.slice(offset, limit);

    return ret
  }
  getStoreById(id){
    let ret = _.find(this.references.stores, store=>store.id===id);
    return ret;
  }
  get isReferenceReceived(){
    return !_.find(this.references, item=>item === null);
  }
  //get promiseSourcesTemplateItem(){return {store_id:null, key:null, type: 'axios', cancel:{axios:null}}}
  set stores(val) {this.references.stores = val}
  //get stores() {return this.references.stores}
  get stores(){
    return this.references.stores //_.sortBy(this.references.stores, item=>{return [item.company.party.name, item.name]})
  }
}

class Price{
  constructor(initial, limit, offset){
    this.data = _.cloneDeep(initial);
    this.total = this.initial.length;
    this.filtered = 0;
    this.shown = 0;
    this.limit = limit;
    this.offset = offset;
  }
 */


