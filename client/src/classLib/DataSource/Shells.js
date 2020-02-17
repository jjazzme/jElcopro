'use strict';

import axios from "axios";
import priceListParametersConstructor from "../../components/tables/parametersConstructor/priceListParametersConstructor";
import documentLinesParametersConstructor from "../../components/tables/parametersConstructor/documentLinesParametersConstructor";
import priceListFooter from "../../components/body/footerComponents/priceListFooter";
import PriceLoadProcessor from "./Shells/PriceLoadProcessor";
import TableLoadProcessor from "./Shells/TableLoadProcessor";
import tableFooter from "../../components/body/footerComponents/tableFooter";
import integerEditor from "../../components/editors/integer";
import floatEditor from "../../components/editors/float";
import documentStatus from "../../components/editors/documentStatus";
// import companySelector from '../../components/editors/companySelector';
import priceListToCard from "../../components/tables/cell/priceListAddToCard";

export default class Shells{
  constructor(limit){
    this.template = {
      Address:{
        binder: {
          key: item=>item.id,
          itemLoader: (key)=>axios.get(`/api/address/${key}`),
          byOpticsLoader: (payload)=>axios.put(
            '/api/address',
            { optics:payload.optics, params:payload.params }
          ),
          updateLoader: (type, item) => axios.post(`/api/address/${item.id}`, item),
          ttl: 3600e3*24,
          cache:[],
          cacheSets: [],
        },
      },
      // образец не включённой в меню сущности
      Currency:{
        binder: {
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            '/api/currency',
            { optics:payload.optics, params:payload.params }
          ),
          ttl: 3600e3*24,
          cache:[],
          cacheSets: [],
        },
        // menu: false, - можно не писать, так как тут false = undefined
        optics: { limit: -1, page: 1 } // для возврата через put всей таблицы
      },
      Company:{
        binder:{
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            `/api/company`,
            {optics:payload.optics, params:payload.params}),
          itemLoader: (key)=>axios.get(`/api/company/${key}`),
          updateLoader: (type, item) => axios.post(`/api/company/${item.id}`, item),
          ttl: 3600e3*24,
          cache: [],
          cacheSets: [],
        },
        initial:{
          id:{show:{ item:true, list:false}, sortable: false, card: false, label: "ID", order: 100},
          party_id:{ label: 'Название', show: true, order: 10, sortable: true,
            html: row => row.party.name,
          },
          inn: { label: 'ИНН', show: true, order: 20, sortable: true,
            html: row => row.party.inn,
          },
          ogrn: { label: 'ОГРН', show: true, order: 30, sortable: true,
            html: row => row.party.ogrn,
          },
          fact_address_id: { label: 'Адрес', show: true, order: 40, sortable: true,
            html: row => row.factAddress.address,
          },
          phone: { label: 'Телефоны', show: true, order: 40, sortable: true,
            html: row => row.phone,
          },

        },
        h1: item => item.party.name,
        controller:{
        },
        name: {one: 'счёт', many: 'счета', cardof: 'счёта',},
        optics: { page: 1, sorters: {}, filters: {}, items: [], limit: limit },
      },
      CurrencyRateService:{
        binder: {
          key: item=>item.id,
          byOpticsLoader: () =>
            axios.put(
              '/api/currencyRateService',
              { date: Date.now() }
            )
          ,
          ttl: 3600e3*24,
          cache:[],
          cacheSets: [],
        },
        optics: { limit: -1, page: 1 }
      },
      Defective:{},
      DocumentLine:{
        binder: {
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            '/api/docline',
            { optics:payload.optics, params:payload.params }
          ),
          itemLoader: (key)=>axios.get(`/api/docline/${key}`),
          updateLoader: (type, item) => axios.post(`/api/docline/${item.id}`, item),
          deleteLoader: (type, key) => axios.delete(`/api/docline/${key}`),
          ttl: 3600e3*24,
          cache: [],
          cacheSets: [],
        },
        parentId: 'document_id',
        opticsConstructor: documentLinesParametersConstructor,
        noFirstRowCell: false,
        loadProcessor: new TableLoadProcessor('DocumentLine'),
        initial:{
          id:{show:false, hidden: true, sortable: false, card: false, label: "ID", order: 1000},
          good_id: { label: 'Товар', order: 10,
            html: row => row.good.product.name,
            to: row => { return { name: 'item', params: { type: 'Product', id: row.good.product.id } } },
          },
          quantity: { label: 'Количество', order: 20,
            editor: integerEditor,
          },
          price_without_vat: { label: 'Цена без НДС', order: 30,
            html: item => item.price_without_vat.toFixed(2),
            editor: floatEditor,
          },
          price_with_vat: { label: 'Цена с НДС', order: 40,
            html: item => item.price_with_vat.toFixed(2),
            editor: floatEditor,
          },
          amount_without_vat: { label: 'Сумма без НДС', order: 50,
            html: item => item.amount_without_vat.toFixed(2),
            editor: floatEditor,
          },
          amount_with_vat: { label: 'Сумма с НДС', order: 60,
            html: item => item.amount_with_vat.toFixed(2),
            editor: floatEditor,
          },
          times:{ label: 'Срок, дней', order: 70 },
          remark:{ label: 'Примечание', order: 80 },
          closed: { label: 'Закрыт', order: 90 },
        },
        controller:{
          scopes:['withArrival', 'withChildren', 'withGood', 'withFutureReserve', 'withParent', 'withReserves', 'withDeparture'],
          where:{  }
        },
        optics: { limit: -1, page: 1 },
        name: {one: 'линия', many: 'линии', cardof: 'линии',},
      },
      Good:{
        binder: {
          key: item => item.id,
          byOpticsLoader: (payload) => axios.put(
            `/api/good`,
            {optics: payload.optics, params: payload.params}),
          itemLoader: (key) => axios.get(`/api/good/${key}`),
          ttl: 3600e3 * 24,
          cache: [], // [[id, updated, {}], [id, updated, {}]]
          cacheSets: [], // [[hash, updated, [ids]], [hash, updated, [ids]]
        },
        initial: {
          id: {show: false, hidden: true, sortable: false, card: false},
          store_id: {
            show: true, order: 10, html: row => row.store.name, sortable: true, label: 'Склад',
            filters: [
              {type: 'search', _placeholder: 'поиск 1'},
            ]
          },
          product_id: {show: true, order: 20, html: row => row.product.name, sortable: true, label: 'Продукт',},
          filters: [
            {type: 'search', _placeholder: 'поиск 1'},
          ]
        },
        ballance: {},
        code: {},
        pack: {},
        multiply: {}
      },
      Invoice:{
        newItem: {
          id: 0,
          date: new Date().toJSON(),
          //number: null,
          user_id: null,
          //document_type_id: null,
          sellerable_id: null,
          sellerable_type: 'Company',
          buyerable_id: null,
          buyerable_type: 'Company',
          store_id: null,
          currency_id: 'R01000',
          amount_with_vat: 0,
          status_id: 'formed',

          store: { name: 'Выберите склад' },
          sellerable:{ party: { name: 'Выберите продавца' } },
          buyerable:{ party: { name: 'Выберите покупателя' } },
          currency: { name: 'Российский рубль' },
        },
        firstCell:{
          menu: [{
              label: 'Строки',
              to: row => { return {name:'manyToOne', params:{ parentType: 'Invoice', id: row.id, field: 'documentLines' } } },
            }
            ]
        },
        binder:{
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            `/api/invoice`,
            {optics:payload.optics, params:payload.params}),
          itemLoader: (key)=>axios.get(`/api/invoice/${key}`),
          updateLoader: (type, item) => axios.post(`/api/invoice/${item.id}`, item),
          deleteLoader: (type, key) => axios.delete(`/api/invoice/${key}`),
          ttl: 3600e3*24,
          cache: [],
          cacheSets: [],
        },
        initial:{
          id:{show:{item:true, list:false}, sortable: false, card: false, label: "ID", order: 100},
          date:{ to: row => { return {name:'item', params:{ type: 'Invoice', id: row.id} } },
            show: true, order:10, sortable: true, label: 'Дата', card: false,
            editor: () => import('../../components/editors/calendar'),
            html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: '2-digit', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric',
                hour12: false
              }).format(new Date(row.date)).replace(',',''),
            filters: [{type: 'calendar_fromto', from:'', to:''}]
          },
          number:{
            to: row => { return { name:'item', params:{ type: 'Invoice', id: row.id } } },
            show: true, order:20, sortable: true, label: 'Номер', card: false,
            //editor: 'integer',
            filters: [
              {type: 'integer_fromto', from:'', to:''},
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          //sellerable:{show:false, shell: 'Company', key: item => item.id},
          sellerable_id:{show: true, order:30,
            object: { as: 'sellerable', model: 'Company' },
            html: row => row.sellerable.party.name, sortable: true, label: 'Продавец',
            to: row => { return {name:'item', params:{ type: 'Company', id: row.sellerable_id} } },
            editor: () => import('../../components/editors/companySelector'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          buyerable_id:{show: true, order:40, sortable: true, label: 'Покупатель',
            object: { as: 'buyerable', model: 'Company' },
            html: row=>row.buyerable.party.name,
            to: row => { return {name:'item', params:{ type: 'Company', id: row.buyerable_id} } },
            editor: () => import('../../components/editors/companySelector'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          store_id:{show: true, order:50, sortable: true, label: 'Склад',
            object: { as: 'store', model: 'Store'},
            editor: () => import('../../components/editors/company/companyStore'),
            html: row=>row.store.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          currency_id:{show: true, order:60, sortable: true, label: 'Валюта',
            object: { as: 'currency', model: 'Currency'},
            editor: () => import('../../components/editors/currency'),
            html: row=>row.currency.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          amount_with_vat:{show: true, order:70, sortable: true, label: 'Сумма',
            html: row => row.amount_with_vat.toFixed(2)
          },
          status_id:{show: true, order: 75, sortable: true, label: 'Статус',
            object: null,
            html: row=>{ return {formed: 'Формируется', reserved: 'Резерв', in_work: 'В работе', closed: 'Закрыт'}[row.status_id] },
            editor: documentStatus,
          },
          user_id:{show: true, order:80, sortable: true, label: 'Автор',
            html: row=>row.user.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          documentLines:{label: 'Строки счёта', shell: 'DocumentLine', show: {item: true},
            html: row => { return `Количество строк: ${ row.documentLines ? row.documentLines.length : '' }` },
            to: row => { return {name:'manyToOne', params:{ parentType: 'Invoice', id: row.id, field: 'documentLines' } } },
          }
        },
        h1: item => `Счёт №${ item.number} от ${Intl.DateTimeFormat('ru-RU').format(new Date(item.date)) } для ${ item.sellerable.party.name }`,
        controller:{
          scopes:['withSellerable', 'withBuyerable', 'withStore', 'withCurrency', 'withSum', 'withUser', 'defaultScope'],
          /*
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
           */
        },
        faIcon: {prefix: "fas", name: "file-invoice-dollar"},
        name: {one: 'счёт', many: 'счета', cardof: 'счёта',},
        menu: 1040,
        optics: { page: 1, sorters: {}, filters: {}, items: [], limit: limit },
      },
      Model:{
        binder: {
          key: item=>item.id,
          itemLoader: (key)=>axios.put(`/api/model`),
          byOpticsLoader: (payload)=>axios.put(
            `/api/model`,
            {optics:payload.optics, params:payload.params}),
          ttl: 3600e3*24,
          cache:[],
          cacheSets: [],
        },
        optics: { limit: -1, page: 1 }
      },
      Movement:{},
      MovementIn:{},
      MovementOut:{},
      Order:{
        newItem: {
          id: 0,
          date: new Date().toJSON(),
          //number: null,
          user_id: null,
          //document_type_id: null,
          sellerable_id: null,
          sellerable_type: 'Company',
          buyerable_id: null,
          buyerable_type: 'Company',
          store_id: null,
          currency_id: 'R01000',
          amount_with_vat: 0,
          status_id: 'formed',

          store: { name: 'Выберите склад' },
          sellerable:{ party: { name: 'Выберите продавца' } },
          buyerable:{ party: { name: 'Выберите покупателя' } },
          currency: { name: 'Российский рубль' },
        },
        firstCell:{
          menu: [{
            label: 'Строки',
            to: row => { return {name:'manyToOne', params:{ parentType: 'Order', id: row.id, field: 'documentLines' } } },
          }
          ]
        },
        binder:{
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            `/api/order`,
            {optics:payload.optics, params:payload.params}),
          itemLoader: (key)=>axios.get(`/api/order/${key}`),
          updateLoader: (type, item) => axios.post(`/api/order/${item.id}`, item),
          deleteLoader: (type, key) => axios.delete(`/api/order/${key}`),
          ttl: 3600e3*24,
          cache: [], // [[id, updated, {}], [id, updated, {}]]
          cacheSets: [], // [[hash, updated, [ids]], [hash, updated, [ids]]
        },
        initial:{
          id:{show:{item:true, list:false}, sortable: false, card: false, label: "ID", order: 100},
          date:{ to: row => { return {name:'item', params:{ table: 'Order', id: row.id} } },
            show: true, order:10, sortable: true, label: 'Дата', card: false,
            editor: () => import('../../components/editors/calendar'),
            html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: '2-digit', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric',
                hour12: false
              }).format(new Date(row.date)).replace(',',''),
            filters: [{type: 'calendar_fromto', from:'', to:''}]
          },
          number:{
            to: row => { return {name:'item', params:{ table: 'Invoice', id: row.id} } },
            show: true, order:20, sortable: true, label: 'Номер', card: false,
            // editor: 'integer',
            filters: [
              {type: 'integer_fromto', from:'', to:''},
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          sellerable_id:{show: true, order:30, sortable: true, label: 'Продавец',
            object: { as: 'sellerable', model: 'Company' },
            html: row=>row.sellerable.party.name,
            to: row => { return {name:'item', params:{ type: 'Company', id: row.sellerable_id} } },
            editor: () => import('../../components/editors/companySelector'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          buyerable_id:{show: true, order:40, sortable: true, label: 'Покупатель',
            object: { as: 'buyerable', model: 'Company' },
            html: row=>row.buyerable.party.name,
            to: row => { return {name:'item', params:{ type: 'Company', id: row.buyerable_id} } },
            editor: () => import('../../components/editors/companySelector'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          store_id:{show: true, order:50, sortable: true, label: 'Склад',
            object: { as: 'store', model: 'Store'},
            editor: () => import('../../components/editors/company/companyStore'),
            html: row=>row.store.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          currency_id:{show: true, order:60, sortable: true, label: 'Валюта',
            object: { as: 'currency', model: 'Currency'},
            editor: () => import('../../components/editors/currency'),
            html: row=>row.currency.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          amount_with_vat:{show: true, order:70, sortable: true, label: 'Сумма',
            html: row => row.amount_with_vat.toFixed(2)
          },
          status_id:{show: true, order: 75, sortable: true, label: 'Статус',
            object: null,
            html: row=>{ return {formed: 'Формируется', reserved: 'Резерв', in_work: 'В работе', closed: 'Закрыт'}[row.status_id] },
            editor: documentStatus,
            },
          user_id:{show: true, order:80, sortable: true, label: 'Автор',
            html: row=>row.user.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          documentLines:{label: 'Строки заказа', shell: 'DocumentLine', show: {item: true},
            html: row => { return `Количество строк: ${ row.documentLines ? row.documentLines.length : '' }` },
            to: row => { return {name:'manyToOne', params:{ parentType: 'Order', id: row.id, field: 'documentLines' } } },
          }
        },
        h1: item => `Заказ №${ item.number} от ${Intl.DateTimeFormat('ru-RU').format(new Date(item.date)) } для ${ item.sellerable.party.name }`,
        controller:{
          scopes:['withSellerable', 'withBuyerable', 'withStore', 'withCurrency', 'withSum', 'withUser', 'defaultScope'],
        },
        menu: 1060,
        faIcon: {prefix: "fab", name:"codepen"},
        name: {one: 'заказ', many: 'заказы', cardof: 'заказа',},
        optics: { page: 1, sorters: {}, filters: {}, items: [], limit: limit },
      },
      Party:{
        binder: {
          key: item=>item.id,
          updateLoader: (type, item) => axios.post(`/api/party/${item.id}`, item),
        },
      },
      ///// образец
      PriceList:{
        loadProcessor: new PriceLoadProcessor(), // класс, обрабатывающий загрузку TODO: () => import('./Shells/PriceLoadProcessor')
        footer: priceListFooter,
        opticsConstructor: priceListParametersConstructor,
        optics: { search: 'max', quantity: 5, fromQuantity: false, onlyDB: true, depth: 20, pages: 1, fromRelevance: false, relevance: 24, selectedStores: [] },
        noFirstRowCell: true,
        getBackSensitive: o => { return o.search.length > 3 ? { name: o.search, from_store_ids: o.selectedStores, onlyDB: o.onlyDB } : null },
        binder:{
          ttl: -1,
          byOpticsLoader: (payload)=>axios.put(
            `/api/price`,
            { optics: payload.optics },
            { headers: {_eid: payload.eid } },
          ),
        },
        initial:{
          online: {label: 'тип', order: 10,
            html: row=>{
              return row.online
                ? "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 496 512\"><path fill=\"currentColor\" d=\"M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z\"></path></svg>"
                : "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><path fill=\"currentColor\" d=\"M448 73.143v45.714C448 159.143 347.667 192 224 192S0 159.143 0 118.857V73.143C0 32.857 100.333 0 224 0s224 32.857 224 73.143zM448 176v102.857C448 319.143 347.667 352 224 352S0 319.143 0 278.857V176c48.125 33.143 136.208 48.572 224 48.572S399.874 209.143 448 176zm0 160v102.857C448 479.143 347.667 512 224 512S0 479.143 0 438.857V336c48.125 33.143 136.208 48.572 224 48.572S399.874 369.143 448 336z\"></path></svg>"


            }
            },
          name: { label:'название',  order: 20,
            to: item=> { return { name:'item', params:{ id:item.good_id, type: 'Good' } } }
            },
          code: { label: 'код',  order: 30 },
          producer_name: { label: 'произв.',  order: 40,
            to: item=> { return { name:'item', params:{ id:item.producer_id, type: 'Producer' } } }
            },
          case: { label: 'корпус',  order: 50,
            to: item=> { return { name:'item', params:{ id:item.parameter_id, type: 'Parameter' } } }
            },
          remark: { label: 'примечание', order: 60 },
          ballance: { label: 'кол-во', order: 70 },
          real: { label: 'добавить', order: 80,
            component: priceListToCard,
              //() => import('../../components/tables/cell/priceListAddToCard')
          },
          actual: { label: 'дата', order: 90,
            html: row=>`<span ${Math.abs(Date.now() -new Date(row.actual)) / 36e5 >= row._relevance ? 'class="text-danger"' : ''}>${Intl.DateTimeFormat(
              'ru-RU',
              {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false
              }).format(new Date(row.actual))}</span>`
          },
          min:{ label: 'мин.', order: 100},
          max:{ label: 'макс.', order: 110 },
          pack: { label: 'упак.', order: 120 },
          multiply: { label: 'кратно', order: 130 },
          priceUSD: { label: 'цена $', order: 140,
            html: row=>row._priceUSD.toFixed(2)
          },
          sumUSD: { label: 'сумма $', order: 150,
            html: row=>row._sumUSD.toFixed(2)
          },
          average_days: { label: 'дней',  order: 160 },
          priceRUR: { label: 'цена ₽',  order: 170,
            html: row=>row._priceRUR.toFixed(2)
          },
          sumRUR: { label: 'сумма ₽', order: 180,
            html: row=>row._sumRUR.toFixed(2)
          },
          vat: { label: 'ндс %', field:'vat', order: 190 },
          party_name: { label: 'поставщик', order: 200,
            to: item=> { return { name:'item', params:{ id:item.company_id, type: 'Company' } } }
            },
          store_name: { label: 'склад', order: 210,
            to: item=> { return { name:'item', params:{ id:item.store_id, type: 'Store' } } }
            },
        },
        menu: 1010,
        faIcon: {prefix: "fas", name:"hand-holding-usd"},
        name: {one: 'прайс', many: 'прайсы', cardof: 'прайса',},
      },
      Product: {
        binder: {
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            `/api/product`,
            { optics: payload.optics, params: payload.params },
            { headers: {_eid: payload.eid } },
            ),
          itemLoader: (key)=>axios.get(`/api/product/${key}`),
          ttl: 3600e3*24,
          cache: [],
          cacheSets: [],
        },
        initial: {
          id:{ show:false, hidden: true, sortable: false, label: 'id' },
          name:{
            to: row => { return { name:'item', params:{ type: 'Product', id: row.id } } },
            editor:'string', show: true, order:10, sortable: true, label: 'Название',
            filters:[
              {type: 'search', _placeholder:'поиск 1'}, // value=''
              {type: 'search', _placeholder:'поиск 2'},
            ]
          },
          vat:{
            editor:'selector', source:'vat' ,show: true, order:20, sortable: true, label: 'НДС %',
            html: row => parseFloat(row.vat)===0?'Без НДС':`${parseFloat(row.vat)}%`
          },
          category_id:{
            editor:'selector', show: true, order:30, sortable: true, label: 'Категория',
            html: row => row.category ? row.category.name : '-//-'
          },
          producer_id:{
            to: row => { return { name:'item', params:{ type: 'Producer', id: row.producer.id } } },
            editor:'selector', show: true, order:40,
            html: item=>item.producer ? item.producer.name : '-//-', sortable: true, label: 'Производитель',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          picture:{
            show: true, order: 50, parentClass:"avatar avatar-sm", sortable: true, label: 'Фото',
            html:item => item.picture===null
              ? ""
              : `<img src="/image/small/${item.picture}" class="rounded-circle">`
          },
        },
        controller:{
          scopes: ['withProducer', 'withCategory'],
          aliases: {
            category_id: {path: 'Category', column: 'name'},
            producer_id: {path: 'Producer', column: 'name'}
          }
        },
        menu: 1020,
        faIcon: {prefix: "fas", name: "barcode"},
        name: {one: 'продукт', many: 'продукты', cardof: 'продукта',},
        optics: { page: 1, sorters: {}, filters: {}, items: [], limit: limit },
        h1: item => `Продукт: ${ item.name}`,
      },
      Producer: {
        binder: {
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            `/api/producer`,
            {optics:payload.optics, params:payload.params}),
          itemLoader: (key)=>axios.get(`/api/producer/${key}`),
          ttl: 3600e3*24,
          cache: [],
          cacheSets: [],
        },
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
          scopes: ['withRightProducer']
          //aliases: { right_producer: {path: 'Producer', column: 'name', as: 'rightProducer'} }
        },
        menu: 1030,
        faIcon: {prefix: "fas", name: "hammer"},
        name: {one: 'производитель', many: 'производители', cardof: 'производителя',},
        optics: { page: 1, sorters: {}, filters: {}, items: [], limit: limit },
      },
      Shell: {
        binder: {
          key: payload => { return { type: payload.type, version: payload.version } },
          itemLoader: ({type}) => axios.get(`/api/shell/${type}`),
          itemSave: ({id, type, version, basket, columns, optics}) => axios.put(`/api/shell/${type}`, {shell: {id, version, basket, columns, optics}}),
          ttl: 10*60e3,
          cache: []
        },
      },
      Store:{
        binder: {
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            '/api/store',
            { optics:payload.optics, params:payload.params }
          ),
          updateLoader: (type, item) => axios.post(`/api/store/${item.id}`, item),
          ttl: 3600e3*24,
          cache:[],
          cacheSets: [],
        },
        menu: false,
        controller:{
          scopes: ['withCompany', 'withAddress'],
        },
        optics: { limit: -1, page: 1 }
      },
      TransferIn:{
        binder: {
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            `/api/transferIn`,
            {optics:payload.optics, params:payload.params}),
          itemLoader: (key)=>axios.get(`/api/transferIn/${key}`),
          deleteLoader: (type, key) => axios.delete(`/api/transferIn/${key}`),
          updateLoader: (type, item) => axios.post(`/api/transferIn/${item.id}`, item),
          ttl: 3600e3*24,
          cache: [],
          cacheSets: [],
        },
        firstCell:{
          menu: [{
            label: 'Строки',
            to: row => { return {name:'manyToOne', params:{ parentType: 'TransferIn', id: row.id, field: 'documentLines' } } },
          }
          ]
        },
        h1: item => `Входящий УПД №${ item.number} от ${Intl.DateTimeFormat('ru-RU').format(new Date(item.date)) } от ${ item.sellerable.party.name }`,
        initial:{
          id:{show:{item:true, list:false}, sortable: false, card: false, label: "ID", order: 100},
          date:{ to: row => { return {name:'item', params:{ table: 'TransferIn', id: row.id} } },
            show: true, order:10, sortable: true, label: 'Дата', card: false,
            editor: () => import('../../components/editors/calendar'),
            html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: '2-digit', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric',
                hour12: false
              }).format(new Date(row.date)).replace(',',''),
            filters: [{type: 'calendar_fromto', from:'', to:''}]
          },
          number:{
            to: row => { return {name:'item', params:{ table: 'TransferIn', id: row.id} } },
            show: true, order:20, sortable: true, label: 'Номер', card: false,
            // editor: 'integer',
            filters: [
              {type: 'integer_fromto', from:'', to:''},
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          sellerable_id:{show: true, order:30, sortable: true, label: 'Продавец',
            html: row=>row.sellerable.party.name,
            editor: () => import('../../components/editors/companySelector'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          buyerable_id:{show: true, order:40, sortable: true, label: 'Покупатель',
            html: row=>row.buyerable.party.name,
            editor: () => import('../../components/editors/companySelector'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          store_id:{show: true, order:50, sortable: true, label: 'Склад',
            html: row=>row.store.name,
            editor: () => import('../../components/editors/company/companyStore'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          currency_id:{show: true, order:60, sortable: true, label: 'Валюта',
            html: row=>row.currency.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          amount_with_vat:{show: true, order:70, sortable: true, label: 'Сумма',
            html: row => row.amount_with_vat.toFixed(2)
          },
          status_id:{show: true, order: 75, sortable: true, label: 'Статус',
            html: row=>{ return {formed: 'Формируется', reserved: 'Резерв', in_work: 'В работе', closed: 'Закрыт'}[row.status_id] },
            editor: documentStatus,
          },
          user_id:{show: true, order:80, sortable: true, label: 'Автор',
            html: row=>row.user.name,
            editor: () => import('../../components/editors/currency'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          documentLines:{label: 'Строки УПД', shell: 'DocumentLine', show: {item: true},
            html: row => { return `Количество строк: ${ row.documentLines ? row.documentLines.length : '' }` },
            to: row => { return {name:'manyToOne', params:{ parentType: 'TransferIn', id: row.id, field: 'documentLines' } } },
          }
          /*
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
           */
        },
        controller:{
          scopes:['withSellerable', 'withBuyerable', 'withStore', 'withCurrency', 'withSum', 'withUser', 'defaultScope'],
        },
        menu: 1070,
        faIcon: {prefix: "fas", name:"file-import"},
        name: {one: 'вх. УПД', many: 'вх. УПД', cardof: 'входящего упд',},
        optics: { page: 1, sorters: {}, filters: {}, items: [], limit: limit },
      },
      TransferOut:{
        firstCell:{
          menu: [{
            label: 'Строки',
            to: row => { return {name:'manyToOne', params:{ parentType: 'TransferOut', id: row.id, field: 'documentLines' } } },
          }
          ]
        },
        h1: item => `Исходящий УПД №${ item.number} от ${Intl.DateTimeFormat('ru-RU').format(new Date(item.date)) } для ${ item.buyerable.party.name }`,
        binder: {
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            `/api/transferOut`,
            {optics:payload.optics, params:payload.params}),
          itemLoader: (key)=>axios.get(`/api/transferOut/${key}`),
          deleteLoader: (type, key) => axios.delete(`/api/transferOut/${key}`),
          updateLoader: (type, item) => axios.post(`/api/transferOut/${item.id}`, item),
          ttl: 3600e3*24,
          cache: [],
          cacheSets: [],
        },
        initial:{
          id:{show:false, hidden: true, sortable: false, card: false},
          date:{show: true, order:10, sortable: true, label: 'Дата', card: false,
            to: row => { return {name:'item', params:{ table: 'TransferOut', id: row.id} } },
            editor: () => import('../../components/editors/calendar'),
            html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: '2-digit', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric',
                hour12: false
              }).format(new Date(row.date)).replace(',',''),
            filters: [{type: 'calendar_fromto', from:'', to:''}]
          },
          number:{show: true, order:20, sortable: true, label: 'Номер', card: false,
            to: row => { return {name:'item', params:{ table: 'TransferOut', id: row.id} } },
            //editor: 'integer',
            filters: [
              {type: 'integer_fromto', from:'', to:''},
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          sellerable_id:{show: true, order:30, sortable: true, label: 'Продавец',
            html: row=>row.sellerable.party.name,
            editor: () => import('../../components/editors/companySelector'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          buyerable_id:{show: true, order:40, sortable: true, label: 'Покупатель',
            html: row=>row.buyerable.party.name,
            editor: () => import('../../components/editors/companySelector'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          store_id:{show: true, order:50, sortable: true, label: 'Склад',
            html: row=>row.store.name,
            editor: () => import('../../components/editors/company/companyStore'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          currency_id:{show: true, order:60, sortable: true, label: 'Валюта',
            html: row=>row.currency.name,
            editor: () => import('../../components/editors/currency'),
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          amount_with_vat:{show: true, order:70, sortable: true, label: 'Сумма',
            html: row => row.amount_with_vat.toFixed(2)
          },
          status_id:{show: true, order: 75, sortable: true, label: 'Статус',
            html: row=>{ return {formed: 'Формируется', reserved: 'Резерв', in_work: 'В работе', closed: 'Закрыт'}[row.status_id] } ,
            editor: documentStatus,
            },
          user_id:{show: true, order:80, html: row=>row.user.name, sortable: true, label: 'Автор',
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          documentLines:{label: 'Строки УПД', shell: 'DocumentLine', show: {item: true},
            html: row => { return `Количество строк: ${ row.documentLines ? row.documentLines.length : '' }` },
            to: row => { return {name:'manyToOne', params:{ parentType: 'TransferIn', id: row.id, field: 'documentLines' } } },
          }
        },
        controller:{
          scopes: ['withSellerable', 'withBuyerable', 'withStore', 'withCurrency', 'withSum', 'withUser', 'defaultScope']
        },
        menu: 1050,
        faIcon: {prefix: "fas", name:"file-export"},
        name: {one: 'исх. упд', many: 'исх. упд', cardof: 'исходящего упд',},
        optics: { page: 1, sorters: {}, filters: {}, items: [], limit: limit },
      },
      TransferInCorrective: {
        binder: {
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            `/api/transferInCorrective`,
            {optics:payload.optics, params:payload.params}),
          itemLoader: (key)=>axios.get(`/api/transferInCorrective/${key}`),
          ttl: 3600e3*24,
          cache: [],
          cacheSets: [],
        },
        h1: item => `Возврат от покупателя №${ item.number} от ${Intl.DateTimeFormat('ru-RU').format(new Date(item.date)) } от ${ item.buyerable.party.name }`,
        initial:{
          id:{show:{item:true, list:false}, sortable: false, card: false, label: "ID", order: 100},
          date:{ to: row => { return {name:'item', params:{ table: 'Order', id: row.id} } },
            show: true, order:10, sortable: true, label: 'Дата', card: false,
            //editor: 'calendar',
            html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: '2-digit', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric',
                hour12: false
              }).format(new Date(row.date)).replace(',',''),
            filters: [{type: 'calendar_fromto', from:'', to:''}]
          },
          number:{
            to: row => { return {name:'item', params:{ table: 'TransferIn', id: row.id} } },
            show: true, order:20, sortable: true, label: 'Номер', card: false,
            // editor: 'integer',
            filters: [
              {type: 'integer_fromto', from:'', to:''},
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          sellerable_id:{show: true, order:30, sortable: true, label: 'Продавец',
            html: row=>row.sellerable.party.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          buyerable_id:{show: true, order:40, sortable: true, label: 'Покупатель',
            html: row=>row.buyerable.party.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          store_id:{show: true, order:50, sortable: true, label: 'Склад',
            html: row=>row.store.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          currency_id:{show: true, order:60, sortable: true, label: 'Валюта',
            html: row=>row.currency.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          amount_with_vat:{show: true, order:70, sortable: true, label: 'Сумма',
            html: row => row.amount_with_vat.toFixed(2)
          },
          //sum:{show: true, order:70, sortable: true, label: 'Сумма', html: row=>_.sumBy(row.documentLines, line=>line.amount_with_vat).toFixed(2)},
          status_id:{show: true, order: 75, sortable: true, label: 'Статус',
            html: row=>{ return {formed: 'Формируется', reserved: 'Резерв', in_work: 'В работе', closed: 'Закрыт'}[row.status_id] },
            editor: documentStatus,
          },
          user_id:{show: true, order:80, sortable: true, label: 'Автор',
            html: row=>row.user.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          documentLines:{label: 'Строки возврата', shell: 'DocumentLine', show: {item: true},
            html: row => { return `Количество строк: ${ row.documentLines ? row.documentLines.length : '' }` },
            to: row => { return {name:'manyToOne', params:{ parentType: 'TransferInCorrective', id: row.id, field: 'documentLines' } } },
          }
        },
        controller:{
          scopes:['withSellerable', 'withBuyerable', 'withStore', 'withCurrency', 'withSum', 'withUser', 'defaultScope'],
        },
        menu: 1080,
        faIcon: {prefix: "fas", name:"hand-point-left"},
        name: {one: 'возврат от покупателя', many: 'возвраты от покупателей', cardof: 'возврата покупателя',},
        optics: { page: 1, sorters: {}, filters: {}, items: [], limit: limit },
      },
      TransferOutCorrective: {
        binder: {
          key: item=>item.id,
          byOpticsLoader: (payload)=>axios.put(
            `/api/transferOutCorrective`,
            {optics:payload.optics, params:payload.params}),
          itemLoader: (key)=>axios.get(`/api/transferOutCorrective/${key}`),
          ttl: 3600e3*24,
          cache: [],
          cacheSets: [],
        },
        h1: item => `Возврат поставщику №${ item.number} от ${Intl.DateTimeFormat('ru-RU').format(new Date(item.date)) } от ${ item.sellerable.party.name }`,
        initial:{
          id:{show:{item:true, list:false}, sortable: false, card: false, label: "ID", order: 100},
          date:{ to: row => { return {name:'item', params:{ table: 'Order', id: row.id} } },
            show: true, order:10, sortable: true, label: 'Дата', card: false,
            //editor: 'calendar',
            html: row=>Intl.DateTimeFormat(
              'ru-RU',
              {
                year: '2-digit', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric',
                hour12: false
              }).format(new Date(row.date)).replace(',',''),
            filters: [{type: 'calendar_fromto', from:'', to:''}]
          },
          number:{
            to: row => { return {name:'item', params:{ table: 'TransferIn', id: row.id} } },
            show: true, order:20, sortable: true, label: 'Номер', card: false,
            // editor: 'integer',
            filters: [
              {type: 'integer_fromto', from:'', to:''},
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          sellerable_id:{show: true, order:30, sortable: true, label: 'Продавец',
            html: row=>row.sellerable.party.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          buyerable_id:{show: true, order:40, sortable: true, label: 'Покупатель',
            html: row=>row.buyerable.party.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
              {type: 'search', _placeholder:'поиск 2'},
            ]},
          store_id:{show: true, order:50, sortable: true, label: 'Склад',
            html: row=>row.store.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          currency_id:{show: true, order:60, sortable: true, label: 'Валюта',
            html: row=>row.currency.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          amount_with_vat:{show: true, order:70, sortable: true, label: 'Сумма',
            html: row => row.amount_with_vat.toFixed(2)
          },
          status_id:{show: true, order: 75, sortable: true, label: 'Статус',
            html: row=>{ return {formed: 'Формируется', reserved: 'Резерв', in_work: 'В работе', closed: 'Закрыт'}[row.status_id] },
            editor: documentStatus,
          },
          user_id:{show: true, order:80, sortable: true, label: 'Автор',
            html: row=>row.user.name,
            filters:[
              {type: 'search', _placeholder:'поиск 1'},
            ]},
          documentLines:{label: 'Строки возврата', shell: 'DocumentLine', show: {item: true},
            html: row => { return `Количество строк: ${ row.documentLines ? row.documentLines.length : '' }` },
            to: row => { return {name:'manyToOne', params:{ parentType: 'TransferOutCorrective', id: row.id, field: 'documentLines' } } },
          }
        },
        controller:{
          scopes:['withSellerable', 'withBuyerable', 'withStore', 'withCurrency', 'withSum', 'withUser', 'defaultScope'],
        },
        menu: 1090,
        faIcon: {prefix: "far", name:"hand-point-right"},
        name: {one: 'возврат поставщику', many: 'возвраты поставщиков', cardof: 'возврата поставщику',},
        optics: { page: 1, sorters: {}, filters: {}, items: [], limit: limit },
      },
      Transition:{
        binder: {
          key: item=>item.id,
          itemLoader: (key)=>axios.put(`/api/transition`),
          updateLoader: (type, item) => axios.post(`/api/transition/${item.id}`, item),
          // item = { id: 100, transion: 'reserve', Model: 'Invoice' }
          ttl: 3600e3*24,
          cache:[],
          cacheSets: [],
        },
        optics: { limit: -1, page: 1 } // для возврата через put всей таблицы
      },
      User: {
        binder: {
          key: item=>item.id,
          itemLoader: (key)=>axios.get(`/api/user/${key}`),
          ttl: 3600e3*24,
          cache: [],
        },
      },
    };
    _.forEach(this.template, (item, name) => {
      if (!item.loadProcessor && item.menu) item.loadProcessor = new TableLoadProcessor(name);
      if (!item.footer) item.footer = tableFooter;
      //if (!item.opticsConstructor) item.opticsConstructor = tableParametersConstructor;
    })
  }

  get getBinders(){
    const ret = {};
    Object.keys(this.template).forEach(key => {
      ret[key] = this.template[key].binder
    });
    return ret;
  }

  getShell(type){

  }

}

/*
  loaders: {
    DocumentLine: {
      key: item=>item.id,

    },
    Invoice: {
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        `/api/invoice`,
        {optics:payload.optics, params:payload.params}),
      itemLoader: (key)=>axios.get(`/api/invoice/${key}`),
      ttl: 3600e3*24,
      cache: [], // [[id, updated, {}], [id, updated, {}]]
      cacheSets: [], // [[hash, updated, [ids]], [hash, updated, [ids]]
    },
    Order: {
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        `/api/order`,
        {optics:payload.optics, params:payload.params}),
      itemLoader: (key)=>axios.get(`/api/order/${key}`),
      ttl: 3600e3*24,
      cache: [], // [[id, updated, {}], [id, updated, {}]]
      cacheSets: [], // [[hash, updated, [ids]], [hash, updated, [ids]]
    },
    Price: {
      ttl: -1,
      byOpticsLoader: (payload)=>axios.put(
        `/api/price`,
        { optics: payload.optics },
        { headers: {_eid: payload.eid } },
        ),
    },
    Product: {
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        `/api/model/get/Product`,
        { optics:payload.optics, params:payload.params }),
      itemLoader: (key)=>axios.get(`/api/product/get/${key}`),
      ttl: 3600e3*24,
      cache: [], // [[id, updated, {}], [id, updated, {}]]
      cacheSets: [], // [[hash, updated, [ids]], [hash, updated, [ids]]
    },
    Producer: {
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        `/api/model/get/Producer`,
        {optics:payload.optics, params:payload.params}),
      itemLoader: (key)=>axios.get(`/api/producer/get/${key}`),
      ttl: 3600e3*24,
      cache: [], // [[id, updated, {}], [id, updated, {}]]
      cacheSets: [], // [[hash, updated, [ids]], [hash, updated, [ids]]
    },
    Shell: {
      key: payload => { return { type: payload.type, version: payload.version } },
      itemLoader: ({type}) => axios.get(`/api/shell/${type}`),
      itemSave: ({id, type, version, basket, columns, optics}) => axios.put(`/api/shell/${type}`, {shell: {id, version, basket, columns, optics}}),
      ttl: 10*60e3,
      cache: []
    },
    TransferIn: {
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        `/api/model/get/TransferIn`,
        {optics:payload.optics, params:payload.params}),
      itemLoader: (key)=>axios.get(`/api/transferin/get/${key}`),
      ttl: 3600e3*24,
      cache: [],
      cacheSets: [],
    },
    TransferOut: {
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        `/api/model/get/TransferOut`,
        {optics:payload.optics, params:payload.params}),
      itemLoader: (key)=>axios.get(`/api/transferout/get/${key}`),
      ttl: 3600e3*24,
      cache: [],
      cacheSets: [],
    },
    User: {
      key: item=>item.id,
      itemLoader: (key)=>axios.get(`/api/user/${key}`),
      ttl: 3600e3*24,
      cache: [],
    },

    Store:{
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        '/api/store',
        { optics:payload.optics, params:payload.params }
      ),
      ttl: 3600e3*24,
      cache:[],
      cacheSets: [],
    },
    Currency:{
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        '/api/currency',
        { optics:payload.optics, params:payload.params }
      ),
      ttl: 3600e3*24,
      cache:[],
      cacheSets: [],
    },
    CurrencyRateService:{
      key: item=>item.id,
      byOpticsLoader: () =>
        axios.put(
        '/api/currencyRateService',
        { date: Date.now() }
        )
      ,
      ttl: 3600e3*24,
      cache:[],
      cacheSets: [],
    },
  },
 */