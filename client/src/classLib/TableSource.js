'use strict';
import _ from "lodash";
//import $ from "cash-dom";
import Vue from "vue";
import crypto from 'crypto';
import store from '../store/_index';

export default class TableSource{

  constructor(type, optics){
    this.dataDebounce = 500;
    this.type = type;
    this.optics = new Optics(optics);
    this.shells = new Shells(type);
    this.basket = new Basket();
    this.data = new Data(type);
    this.htmlObject = null;
    this.drag = {before:0, column:null, from:0, startObjWidth:0, startX: 0, action: null};
    this.iOptics = { filters: {}, sorters: {} };
    this.dbId = 0;
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
    store.dispatch('LOADER/getItem', { type: 'Shell', payload: { type: type, version: this.version} })
      .then(ans=>{
        if(ans && ans.version === this.version) {
          Vue.set(this, 'dbId', ans.id);
          Vue.set(this.basket, 'value', ans.basket);
          Vue.set(this.shells, 'value', ans.columns);
          Vue.set(this.optics, 'value', ans.optics);
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

        if (this.dbId===0 || isDifferentVersions || !_.isEqual(this.optics.value, opticsBeforeMerge)) this.saveShell();

      })
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
        this.saveShell(payload);
      });
  }
  reset() {
    this.optics.value.sorters = _.cloneDeep(this.iOptics.sorters);
    this.optics.value.filters = _.cloneDeep(this.iOptics.filters);
  }
  setRowWidth(){
    let width = 70;
    Object.keys(this.shells.value).map((k) => {
      width += this.htmlObject.querySelector(`div[data-column="${k}"]`).offsetWidth;
    });
    Vue.set(this.shells, 'width', width);
  }
  saveShell(payload){
    if (!payload) payload = this.saveShellPayload;
    store.dispatch('LOADER/saveItem', { type: 'Shell', payload: payload })
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

export class Optics {
  constructor({page, sorters, filters, items, depth}){
    this.value = {page: page ?? 1, sorters: sorters ?? {}, filters: filters ?? {}, items: items ?? [], depth: depth ?? 15};
    /*
    this.page = page ?? 1;
    this.sorters = sorters ?? {};
    this.filters = filters ?? {};
    this.items = items ?? [];
    this.depth = depth ?? 15;
     */
  }

  get initialSorter() { return Object.freeze({order:null, value:null}) }
  merge(value){
    _.forEach(value, (val, key)=>{
      if (this[key] !== undefined) Vue.set(this, key, val);
    });
  }
}

export class Shells {
  constructor(type){
    this.assembled = false;
    this.headerHeight = 40;
    this.template = {
      //assembled:timestamp
      //version
      //updated:timestamp
      //basket:[],
      //columns:null,
      //optics: null,
      //table: name
      //controller:{aliases: {_id: {path: '', column: '', as: ''},}},
      Product: {
        initial: {
          id:{show:false, hidden: true, sortable: false},
          name:{to:{name:'modelItem', params:{table: 'Product', id:'$id'}}, editor:'string' ,show: true, order:1, sortable: true, label: 'Название',
            filters:[
              {type: 'search', _placeholder:'поиск 1'}, // value=''
              {type: 'search', _placeholder:'поиск 2'},
            ]
          },
          vat:{editor:'selector', source:'vat' ,show: true, order:2, sortable: true, label: 'НДС %',
            html: item => parseFloat(item.vat)===0?'Без НДС':`${parseFloat(item.vat)}%`},
          category_id:{editor:'selector', show: true, order:3, html: item=>item.Category ? item.Category.name : '-//-', sortable: true, label: 'Категория'},
          producer_id:{editor:'selector', show: true, order:4, html: item=>item.Producer ? item.Producer.name : '-//-', sortable: true, label: 'Производитель',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          picture:{show: true, order: 5, parentClass:"avatar avatar-sm", sortable: true, label: 'Фото',
            html:item => item.picture===null
              ? ""
              : `<img src="/image/small/${item.picture}" class="rounded-circle">`},
        },
        controller:{
          aliases: {
            category_id: {path: 'Category', column: 'name'},
            producer_id: {path: 'Producer', column: 'name'}
          }
        },
        menu: true,
        faIcon: {prefix: "fas", name: "barcode"},
        name: {one: 'продукт', many: 'продукты', cardof: 'продукта',},
      },
      Producer: {
        initial: {
          id:{show:false, hidden: true, sortable: false},
          name:{editor:'string' ,show: true, order:1, sortable: true, label: 'Название',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]
          },
          site:{editor:'string' ,show: true, order:2, sortable: true, label: 'Сайт',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]
          },
          right_producer_id:{show: true, order:4, html: item => item.rightProducer ? item.rightProducer.name : '-//-', sortable: true, label: 'Правильный производитель',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          picture:{show: true, order: 5, parentClass:"avatar avatar-sm", sortable: true, label: 'Фото',
            html:pic => pic===null
              ? ""
              : `<img src="/image/small/${pic}" class="rounded-circle">`},
        },
        controller:{
          aliases: {
            right_producer: {path: 'Producer', column: 'name', as: 'rightProducer'}
          }
        },
        //menu: '<span><i class="fas fa-hammer"></i></span> Продюсеры',
        //model: 'Producer'
        menu: true,
        faIcon: {prefix: "fas", name: "hammer"},
        name: {one: 'производитель', many: 'производители', cardof: 'производителя',},
      },
      Order:{
        initial:{
          id:{show:false, hidden: true, sortable: false, card: false},
          date:{to: {name:'modelItem', params:{table: 'Order', id:'$id'}}, editor: 'calendar', show: true, order:10, sortable: true, label: 'Дата', card: false,
            html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: '2-digit', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric',
                hour12: false
              }).format(new Date(row.date)).replace(',',''),
            filters: [{type: 'calendar_fromto', from:'', to:''}]
          },
          number:{to: {name:'modelItem', params:{table: 'Order', id:'$id'}}, editor: 'integer', show: true, order:20, sortable: true, label: 'Номер', card: false,
            filters: [
              {type: 'integer_fromto', from:'', to:''},
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          sellerable_id:{show: true, order:30, html: row=>row.sellerable.party.name, sortable: true, label: 'Продавец',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          buyerable_id:{show: true, order:40, html: row=>row.buyerable.party.name, sortable: true, label: 'Покупатель',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          store_id:{show: true, order:50, html: row=>row.store.name, sortable: true, label: 'Склад',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          currency_id:{show: true, order:60, html: row=>row.currency.name, sortable: true, label: 'Валюта',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          sum:{show: true, order:70, sortable: true, label: 'Сумма', html: row=>_.sumBy(row.documentLines, line=>line.amount_with_vat).toFixed(2)},
          status_id:{show: true, order: 75, sortable: true, label: 'Статус', html: row=>{ return {formed: 'Формируется', reserved: 'Резерв', in_work: 'В работе'}[row.status_id] } },
          user_id:{show: true, order:80, html: row=>row.user.name, sortable: true, label: 'Автор',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
        },
        controller:{
          aliases: {
            sellerable_id: {path: 'Company.Party', as:'sellerable.party', column: 'name'},
            buyerable_id: {path:'Company.Party', as:'buyerable', column: 'name'},
            store_id: {path: 'Store', column: 'name'},
            currency_id: {path: 'Currency', column: 'name'},
            user_id: {path: 'User', column: 'name'},
            sum: {path: 'DocumentLine', as: 'documentLines'}
          },
          filters:{
            document_type_id: [{type: '=', value: 'order'}],
          }
        },
        menu: true,
        faIcon: {prefix: "fab", name:"codepen"},
        name: {one: 'заказ', many: 'заказы', cardof: 'заказа',},
      },
      Invoice:{
        directives:{
          original: 'documents',
          where: [['document_type_id', '=', 'order']],
          with: ['sellerable', 'buyerable', 'store', 'currency', 'user'],
          terms:{sellerable:'companies',buyerable:'companies'},
          self:['document_lines']
        },
        initial:{
          id:{show:false, hidden: true, sortable: false, card: false,},
          date:{to: {name:'modelItem', params:{table: 'Invoice', id:'$id'}}, editor: 'calendar', show: true, order:10, sortable: true, label: 'Дата', card: false,
            html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: '2-digit', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric',
                hour12: false
              }).format(new Date(row.date)).replace(',',''),
            filters: [{type: 'calendar_fromto', from:'', to:''}]
          },
          number:{to: {name:'modelItem', params:{table: 'Invoice', id:'$id'}}, editor: 'integer', show: true, order:20, sortable: true, label: 'Номер', card: false,
            filters: [
              {type: 'integer_fromto', from:'', to:''},
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          sellerable_id:{show: true, order:30, html: row=>row.sellerable.party.name, sortable: true, label: 'Продавец',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          buyerable_id:{show: true, order:40, html: row=>row.buyerable.party.name, sortable: true, label: 'Покупатель',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          store_id:{show: true, order:50, html: row=>row.store.name, sortable: true, label: 'Склад',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          currency_id:{show: true, order:60, html: row=>row.currency.name, sortable: true, label: 'Валюта',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          sum:{show: true, order:70, sortable: true, label: 'Сумма', html: row=>_.sumBy(row.documentLines, line=>line.amount_with_vat).toFixed(2)},
          status_id:{show: true, order: 75, sortable: true, label: 'Статус', html: row=>{ return {formed: 'Формируется', reserved: 'Резерв', in_work: 'В работе'}[row.status_id] } },
          user_id:{show: true, order:80, html: row=>row.user.name, sortable: true, label: 'Автор',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
        },
        controller:{
          aliases:{
            sellerable_id: {path: 'Company.Party', as:'sellerable.party', column: 'name'},
            buyerable_id: {path:'Company.Party', as:'buyerable', column: 'name'},
            store_id: {path: 'Store', column: 'name'},
            currency_id: {path: 'Currency', column: 'name'},
            user_id: {path: 'User', column: 'name'},
            sum: {path: 'DocumentLine', as: 'documentLines'}
          },
          filters:{
            document_type_id: [{type: '=', value: 'invoice'}],
          }
        },
        faIcon: {prefix: "fas", name: "file-invoice-dollar"},
        name: {one: 'счёт', many: 'счета', cardof: 'счёта',},
        menu: true,
      },
      documentLinesOI:{
        initial:{
          amount_with_vat:{},
          amount_without_vat:{},
          closed:{},

        }
      },
      _class: 'таблицы',
      _version: 'x'
    };
    this.initial = type ? Object.freeze(this.template[type].initial) : null;
    this.loaded = false;
    this.value = type ? _.cloneDeep(this.template[type].initial) : null;
    this.params = type ? _.cloneDeep(this.template[type].controller) : null;
    this.width = 0;

    _.forEach(this.value, column=>{
      if (column.filters) _.forEach(column.filters, filter=>{filter.value=''});
    });

  }
}

export class Basket {
  constructor(){
    this.show = false;
    this.value = [];
  }
}

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