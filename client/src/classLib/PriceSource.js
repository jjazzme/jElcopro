'use strict';

export default class PriceSource{

  constructor({
      optics: {search, quantity, fromQuantity, selectedStores, depth, pages, debounceAmount},
  }){
    this.optics = new Optics({search, quantity, fromQuantity, selectedStores, depth, pages, debounceAmount});
    this.shell = new Shell();
    this.data = new Data({depth, pages});
  }
}

class Optics{
  constructor({search, quantity, fromQuantity, selectedStores, depth, pages, debounceAmount}){
    this.search = search;
    this.quantity = quantity;
    this.fromQuantity = fromQuantity;
    this.selectedStores = selectedStores;
    this.depth = depth;
    this.pages = pages;
    this.debounceAmount = debounceAmount;
    this.minSearchLenSensitivity = 4;
  }

  get backSensitive(){
    return {name: this.search, from_store_ids: this.selectedStores}
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
      add:{
        cell1:{alias: 'добавить', component: 'addButton', vModelComputed: 'comp'}
      },
      main:{
        first:{
          cell1: {alias:'название', field:'name', to: item=> {return {name:'goods', params:{id:item.good_id}}}},
          cell2: {alias: 'производитель', field:'producer_name', to: item=> {return {name:'producer', params:{id:item.producer_id}}} },
          cell3: {alias: 'корпус', field: 'case', to: item=> {return {name:'case', params:{id:item.parameter_id}}}},
          cell4: {alias: 'примечание', field: 'remark'},
        },
        second:{
          cell1: {alias: 'код', field:'code'},
          cell2: {alias: 'склад', field:'store_name', to: item=> {return {name:'store', params:{id:item.store_id}}}},
          cell3: {alias: 'поставщик', field:'party_name', to: item=> {return {name:'company', params:{id:item.company_id}}} },
          cell4:{alias: 'минимум', field:'min'},
          cell5:{alias: 'максимум', field:'max'},
        },
        third:{
          cell1: {alias: 'тип', field:'online', html: row=>{
              return row.online
                ? "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"globe\" class=\"svg-inline--fa fa-globe fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 496 512\"><path fill=\"currentColor\" d=\"M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z\"></path></svg>"
                : "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"database\" class=\"svg-inline--fa fa-database fa-w-14\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><path fill=\"currentColor\" d=\"M448 73.143v45.714C448 159.143 347.667 192 224 192S0 159.143 0 118.857V73.143C0 32.857 100.333 0 224 0s224 32.857 224 73.143zM448 176v102.857C448 319.143 347.667 352 224 352S0 319.143 0 278.857V176c48.125 33.143 136.208 48.572 224 48.572S399.874 209.143 448 176zm0 160v102.857C448 479.143 347.667 512 224 512S0 479.143 0 438.857V336c48.125 33.143 136.208 48.572 224 48.572S399.874 369.143 448 336z\"></path></svg>"


            }},
          cell2: {alias: 'дата', field:'actual', html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false
              }).format(new Date(row.actual))},
          cell3: {alias: 'упаковка', field:'pack'},
          cell4: {alias: 'кратно', field:'multiply'},
          cell5: {alias: 'цена $', field:'priceUSD', html: row=>row.convertPrice(row.our_price, row.currency_id).usd.toFixed(2)},
          //cell6: {alias: 'сумма $', field:'our_price', field1:'sum_usd', html: num=>num.toFixed(2)},
          //cell7: {alias: 'сумма ₽', field:'our_price', field1:'sum_ru', html: num=>num.toFixed(2)},
        }
      },
      price:{
        first:{
          cell1: {alias: 'кол-во', field:'ballance'},
          cell2: {alias: 'срок (дней)', field:'average_days'},
        },
        second:{
          cell1: {alias: 'НДС', field:'vat'},
          cell2: {alias: 'цена ₽', field:'priceRUR', html: row=>row.convertPrice(row.our_price, row.currency_id).rur.toFixed(2)},
        },
      }
    };
  }

}

class Data{
  constructor({depth, pages}) {
    this.depth = depth;
    this.pages = pages;
    this.references = {stores: null, currencies: null, currencyRates: null};
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
    const limit = optics.depth*optics.pages;
    const offset = optics.offset ?? 0;

    let ret = this._price.slice(offset, limit);
    _.forEach(ret, (row)=>{
      row.convertPrice =  function(val, curID){
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
      }.bind({_currency: this.references.currencies, _currencyRate: this.references.currencyRates})
    });
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
