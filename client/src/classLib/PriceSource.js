'use strict';

export default class PriceSource{

  constructor({
      search, quantity, fromQuantity, onlyDB, selectedStores, depth, pages, debounceAmount, minSearchLenSensitivity
  }){
    this.card = {
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
          actual: {alias: 'дата', field:'actual', html: row=>`<span ${Math.abs(Date.now() -new Date(row.actual)) / 36e5 >= row._relevance ? 'class="text-danger"' : ''}>${Intl.DateTimeFormat(
              'ru-RU',
              {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false
              }).format(new Date(row.actual))}</span>`},
          three121:{
            min:{alias: 'мин.', field:'min'},
            max:{alias: 'макс.', field:'max'},
            pack: {alias: 'упак.', field:'pack'},
            multiply: {alias: 'кратно', field:'multiply'},
          },
          three122:{
            priceUSD: {alias: 'цена $', field:'_priceUSD', html: row=>row._priceUSD.toFixed(2), _html: row=>row.convertPrice(row.our_price, row.currency_id).usd.toFixed(2)},
            sumUSD: {alias: 'сумма $', field:'_sumUSD', html: row=>row._sumUSD.toFixed(2), _html: row=>row.summPrice(row).usd.toFixed(2)},
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
          priceRUR: {alias: 'цена ₽', field:'_priceRUR', html: row=>row._priceRUR.toFixed(2), _html: row=>row.convertPrice(row.our_price, row.currency_id).rur.toFixed(2)},
          sumRUR: {alias: 'сумма ₽', field:'_sumRUR', html: row=>row._sumRUR.toFixed(2), _html: row=>row.summPrice(row).rur.toFixed(2)},
          vat: {alias: 'ндс', field:'vat'},
        },
      }
    };
    this.debounceAmount = debounceAmount;
    this.depth = depth;
    this.filteredCount = 0;
    this.fromQuantity = !!fromQuantity;
    this.fromRelevance = false;
    this.minSearchLenSensitivity = minSearchLenSensitivity;
    this.offset = 0;
    this.onlyDB = onlyDB;
    this.quantity = parseInt(quantity);
    this.pages = pages;
    this.relevance = 24;
    this.source = [];
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
    this.updateID = 0;
  }

  get count(){return this.source.length}
  getStoreById(id){return _.find(this.references.stores, store => store.id === id);}
  get isReferenceReceived(){return !_.find(this.references, item=>item === null);}
  get isStores() {return this.references.stores ? this.references.stores.length > 0 : false }
  nextPage(){this.pages++;}
  onePage(){this.pages = 1;}
}


