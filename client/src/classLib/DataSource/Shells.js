'use strict'
//import _ from "lodash";

import axios from "axios";
import Error from "../Error";

export default class Shells{
  constructor(){
    this.value = {
      Invoice:{
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
        menu: true,
        faIcon: {prefix: "fas", name: "hammer"},
        name: {one: 'производитель', many: 'производители', cardof: 'производителя',},
      },
      Store:{
        menu: false,
        controller:{
          aliases: {
            company_id: { path: 'Company', as: 'company' },
            address_id: { path: 'Address', as: 'address' }
          }
        },
      },
      Currency:{
        menu: false,
      },
      CurrencyRate:{
        menu: false,
        controller:{
          aliases: {
            currency_id: { path: 'Currency', as: 'currency' },
          }
        },
      },
      TransferIn:{
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
            document_type_id: [{type: '=', value: 'transfer-in'}],
          }
        },
        menu: true,
        faIcon: {prefix: "fas", name:"file-import"},
        name: {one: 'вх. УПД', many: 'вх. УПД', cardof: 'входящего упд',},
      },
      TransferOut:{
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
            document_type_id: [{type: '=', value: 'transfer-out'}],
          }
        },
        menu: true,
        faIcon: {prefix: "fas", name:"file-export"},
        name: {one: 'исх. упд', many: 'исх. упд', cardof: 'исходящего упд',},
      },

      documentLinesOI:{
        initial:{
          amount_with_vat:{},
          amount_without_vat:{},
          closed:{},

        }
      },
    };
  }

}