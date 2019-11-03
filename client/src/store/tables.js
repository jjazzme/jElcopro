import axios from 'axios';
//import _ from 'lodash';


let state = {
  events:[],
  cache:[],
  cacheMaxLen: 100,
  cacheTTL: 10*60*1000, //ms 10 min
  initialCache: {
    name: '', //table name, if service = _service_NAME
    optics:{},
    response:{},
    timestamp: null
  },
  initialEvent: {text:'', created:null},
  initialOptics:{
    page:1,
    sorters:{},
    filters:{},
    items:[], //ids
    aliases:{},
    pages:0,
    pageSize:15,
    _notForRouter:['aliases'],
    _notForStore:['items', 'pages'],
    _forCompare:['page', 'sorters', 'filters', 'pageSize'],
  },
  initialSorter:{order:null, value:null},
  initialTable: {
    data: [],
    permissions:null,
    saveQueue: {}, //<------- реализовать
    //iData: [],
    name: null,
    queryOptics: null,
    shell: {},
  },
  selectors:{
    vat:{
      options: [{text:"Без НДС", value:"0"}, {text:"10%", value:"10"}, {text:"20%", value:"20"}]
    },
    Category:{
      source: {
        fields: ['id','name'],
        orderby: 'name',
        map: item => {return {text: item.name, value: item.id}},
        add: {text: '-//-', value: null},
      },
      options: null,
      created: null,
    },
    Producer:{
      source: {
        fields: ['id','name'],
        orderby: 'name',
        map: item => {return {text: item.name, value: item.id}},
        add: {text: '-//-', value: null},
      },
      options: null,
      created: null,
    },

  },
  modelData:{
    Store:{
      data:[],
      created: null,
      includes: [{path: 'Company.Party'}],
      sorters: [['company', 'party', 'name', 'ASC'], ['name', 'ASC']]
    }
  },
  shells: {
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
      //menu: '<span><i class="fas fa-barcode"></i></span> Продукты',
      //model: 'Product',
      menu: true,
      faIcon: {prefix: "fas", name: "barcode"},
      name: {one: 'продукт', many: 'продукты'},
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
      name: {one: 'производитель', many: 'производители'},
    },
    Order:{
      initial:{
        id:{show:false, hidden: true, sortable: false},
        date:{editor: 'calendar', show: true, order:1, sortable: true, label: 'Дата',
          filters: [{type: 'calendar_fromto', from:'', to:''}]
        },
        number:{editor: 'integer', show: true, order:2, sortable: true, label: 'Номер',
          filters: [
            {type: 'integer_fromto', from:'', to:''},
            {type: 'search', _placeholder:'поиск 1'},
          ]},
        sellerable_id:{show: true, order:3, html: item=>item.Buyerable ? item.Buyerable.name : '-//-', sortable: true, label: 'Продавец',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
            {type: 'search', _placeholder:'поиск 2'},
          ]},
        buyerable_id:{show: true, order:4, html: item=>item.Buyerable ? item.Buyerable.name : '-//-', sortable: true, label: 'Покупатель',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
            {type: 'search', _placeholder:'поиск 2'},
          ]},
        store_id:{show: true, order:5, html: item=>item.Store ? item.Store.name : '-//-', sortable: true, label: 'Склад',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
          ]},
        currency_id:{show: true, order:6, html: item=>item.Currency ? item.Currency.name : '-//-', sortable: true, label: 'Валюта',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
          ]},
        //sum:{show: true, order:7, from:'amount_with_vat', sortable: true, label: 'Сумма',
        //  processor: v=>parseFloat(v ? v : "0")},
        user_id:{show: true, order:8, html: item=>item.User ? item.User.user : '-//-', sortable: true, label: 'Автор',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
          ]},
      },
      controller:{
        aliases: {
          user_id: {path: 'User', column: 'name'},
          store_id: {path: 'Store', column: 'name'},
          currency_id: {path: 'Currency', column: 'name'},
          sellerable_id: {path: 'Company', column: 'name', as: 'sellerable'},
          buyerable_id: {path: 'Company', column: 'name', as: 'buyerable'},
        }
      },
      //model: 'Order'
      // menu: '<span><i class="fab fa-codepen"></i></span> Заказы',
      menu: true,
      faIcon: {prefix: "fab", name:"codepen"},
      name: {one: 'заказ', many: 'заказы'},
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
        id:{show:false, hidden: true, sortable: false},
        date:{editor: 'calendar', show: true, order:1, sortable: true, label: 'Дата',
          filters: [{type: 'calendar_fromto', from:'', to:''}]
        },
        number:{editor: 'integer', show: true, order:2, sortable: true, label: 'Номер',
          filters: [
            {type: 'integer_fromto', from:'', to:''},
            {type: 'search', _placeholder:'поиск 1'},
          ]},
        selName:{show: true, order:3, from:'sellerable.party.name', sortable: true, label: 'Покупатель',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
            {type: 'search', _placeholder:'поиск 2'},
          ]},
        buyName:{show: true, order:4, from:'buyerable.party.name', sortable: true, label: 'Продавец',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
            {type: 'search', _placeholder:'поиск 2'},
          ]},
        strName:{show: true, order:5, from:'store.name', sortable: true, label: 'Склад',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
          ]},
        curName:{show: true, order:6, from:'currency.name', sortable: true, label: 'Валюта',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
          ]},
        sum:{show: true, order:7, from:'amount_with_vat', sortable: true, label: 'Сумма',
          processor: v=>parseFloat(v ? v : "0")},
        usrName:{show: true, order:8, from:'user.name', sortable: true, label: 'Автор',
          filters:[
            {type: 'search', _placeholder:'поиск 1'},
          ]},
      },
      //menu: '<span><i class="fas fa-file-invoice-dollar"></i></span> Счета',
      //model: 'Invoice'
      faIcon: {prefix: "fas", name: "file-invoice-dollar"},
      name: {one: 'счёт', many: 'счета'},
      menu: true,
    },
    document_lines:{

    },
    _class: 'таблицы',
  },
  editorStack:[],
};

let getters = {
    GET_CACHE_ITEM: state => (table) => {
    const optics = actualOptics(table.shell.optics);
    const item = state.cache.find((item)=>{
      return table.name === item.name && _.isEqual(item.optics, optics) && item.timestamp + state.cacheTTL > Date.now();
    });
    return item
    },
    GET_INITIAL_SORTER: state => _.cloneDeep(state.initialSorter),
    GET_INITIAL_TABLE: state => _.cloneDeep(state.initialTable),
    GET_LAST_EVENT: state => state.events.length>0 ? state.events[0] : null,
    GET_SELECTOR: state => (name) => state.selectors[name],
    GET_SHELL: state => name => name ? _.cloneDeep(state.shells[name]) : null,
    //GET_SHELL_ASSEMBLED: state => name => name? !!state.shells[name].assembled : false,
    GET_SHELLS: state => _.cloneDeep(state.shells),
    GET_EDITOR_STACK_COUNT: state => state.editorStack.length,
    GET_EDITOR_STACK_HAS_MODEL_ID: state => ({model, id})=> !!_.find(state.editorStack, item => item.model==model && item.id==id),
    GET_EDITOR_STACK_VALUE: state => ({model, id, column}) => _.find(state.editorStack, item => item.model==model && item.id==id && item.column==column),


    GET_STATE: state=> state,
};

let mutations = {
  ADD_CACHED_ITEM(state,item) {
    state.cache.unshift(_.cloneDeep(item));
  },
  ADD_EDITOR_STACK(state, {model, id, column, value, text, isInitialEqual}){
    //TODO добавить изменения в кэшах

    // eslint-disable-next-line
    const removed = _.remove(state.editorStack, item => item.model==model && item.id==id && item.column==column);
    if (!isInitialEqual) state.editorStack.push({model,id,column,value, text});
  },
  ADD_EVENT(state, event){
    state.events.unshift({event: event, created:Date.now()});
    if (state.events.length>state.cacheMaxLen) state.events.splice(state.cacheMaxLen, state.events.length-state.cacheMaxLen);
  },
  INITIAL_SHELL(state, name){
    _.forEach(state.shells[name].initial, column=>{
      if (column.filters) _.forEach(column.filters, filter=>{filter.value=''});
    });
  },
  REMOVE_EDITOR_STACK_BY_MODEL_ID(state, {model, id}){
    _.remove(state.editorStack, item=>item.model===model && item.id==id);
    state.editorStack.splice(0,0)
  },
  REMOVE_OLD_CACHED(state){
    // усекает устаревшие и вышедшие за пределы массива элементы
    // eslint-disable-next-line no-unused-vars
    let ret = _.remove(state.cache, function (item) {
      return item.timestamp+state.cacheTTL<Date.now()
    });
    if (state.cache.length>state.cacheMaxLen) ret = ret.concat(state.cache.splice(state.cacheMaxLen, state.cache.length-state.cacheMaxLen));
  },
  SET_SELECTOR_OPTIONS(state, {name, options, add}){
    state.selectors[name].created = Date.now();
    state.selectors[name].options = options;
    if (add) state.selectors[name].options.push(add);
  },
  SET_SHELL(state, shell) {
    state.shells[shell.table] =shell;
  },
  UPDATE_CACHE_AFTER_CHANGE(state, {model, id, column, value, isInitialEqual}){
      console.log({model,id, column,value, isInitialEqual});
  },
  UPTOTOP_CACHE(state, cached){
    state.cache.unshift(
        _.remove(state.cache, function (item) {
          return _.isEqual(item, cached)
        })[0]
    );
  },
};

let actions = {
  GET_OPTIONS({state, commit, getters, rootGetters}, {model, column, value, text}){
    return new Promise((resolve,reject)=>{
      if (value === undefined) value = null;
      const user = rootGetters['AUTH/GET_USER'];
      const sou = state.shells[model].controller?.aliases[column]?.path ? _.last(state.shells[model].controller.aliases[column].path.split('.')) : column;
      const selector = getters.GET_SELECTOR(sou);
      if (
          (selector.options && !selector.source)
          || (selector.created && selector.created + state.cacheTTL > Date.now())
      ){
        // если кэш
        let res = _.cloneDeep(selector.options);
        if (res.filter(i=>i.value==value).length===0) res.push({text:text, value:value});
        resolve({options: _.sortBy(res, i=>i.value), selected:value})
      } else {
        axios.put(`/api/model/options/${sou}/${user.id}`, {fields: selector.source.fields})
            .then(r=>{
              let res = r.data.map(selector.source.map);
              commit('SET_SELECTOR_OPTIONS', {name:sou, options:res, add: selector.source.add});
              if (res.filter(i=>i.value==value).length===0) res.push({text:text, value:value});
              resolve({options: _.sortBy(res, i=>i.text), selected:value});
            })
            .catch(e=>reject(e))
      }
    });
  },
  LOAD_MODEL({state, rootGetters}, model){
    return new Promise((resolve, reject)=>{
      if (state.modelData[model].data.length === 0 || state.modelData[model].created + state.cacheTTL < Date.now()) {
        const user = rootGetters['AUTH/GET_USER'];
        axios.put(`/api/model-data/get/${model}/${user.id}`, {includes: state.modelData[model].includes, sorters: state.modelData[model].sorters})
            .then(r=>{resolve(r.data)})
            .catch(e=>reject(e))
      } else {
        resolve(state.modelData[model].data);
      }
    });
  },
  LOAD_PAGE({state, commit, getters, rootGetters}, table){
    commit('REMOVE_OLD_CACHED');
    let item = getters.GET_CACHE_ITEM(table);
    if(item) {
      commit('UPTOTOP_CACHE', item);
    } else {
      const user = rootGetters['AUTH/GET_USER'];
      const optics = actualOptics(table.shell.optics);
      const name = table.name;
      const page = optics.page;

      let item = _.cloneDeep(state.initialCache);
      item.optics = _.cloneDeep(optics);
      item.name = name;

      axios.put(
          `/api/model/get/${name}/${user.id}/${page}`,
          {optics: optics, params:getters.GET_SHELL(name).controller}
      )
          .then(
            response=>{
              item.response = response.data; ///// _.cloneDeep(
              item.timestamp = Date.now();
              commit('ADD_CACHED_ITEM', item);
            },
              // eslint-disable-next-line
            error=>console.log(error)
          )
          // eslint-disable-next-line
          .catch(error=>console.log(error))

    }
  },
  /**
   *
   * @param state
   * @param rootGetters
   * @param optics {service,name,store}
   * @constructor
   */
  LOAD_SERVICE({state, rootGetters}, optics){
    const user = rootGetters['AUTH/GET_USER'];
    axios.put(`/api/service/get/${user.id}`, {optics:optics})
  },
  // eslint-disable-next-line no-unused-vars
  /**
   *
   * @param state
   * @param commit
   * @param getters
   * @param dispatch
   * @param rootGetters
   * @param table
   * @constructor
   */
  SET_SHELL({state, commit, getters, dispatch, rootGetters}, table){
    const user = rootGetters['AUTH/GET_USER'];
    if(!getters.GET_SHELL(table.name).assembled) commit('INITIAL_SHELL', table.name);
    let shell = getters.GET_SHELL(table.name);
    const checked = JSON.stringify(shell) + JSON.stringify(state.initialOptics) + JSON.stringify(state.initialSorter);
    const currentVersion = checksum(checked); //<----------------- возможно заменить на md5

    shell.version = currentVersion;
    shell.table = table.name;

    if(!shell.assembled){
      // ещё не собран
      // 1) из базы
      axios.get(`/api/shell/${table.name}/${user.id}`)
          .then(r=>{
            const data = r.data;
            if (data && data.version===currentVersion){
              shell.basket = _.cloneDeep(data.basket);
              shell.columns = _.cloneDeep(data.columns);
              shell.optics = _.cloneDeep(data.optics);
              shell.id = data.id;
            } else {
              shell.basket = [];
              shell.columns = _.cloneDeep(shell.initial);
              shell.optics = _.cloneDeep(state.initialOptics);
              shell.id = data ? data.id : 0;

              // собираем сортеры и фильтры в оптике
              _.forEach(shell.columns, (v1, k1) => { //<-------
                //k1 - columnName
                //v1 - column properties
                // eslint-disable-next-line no-constant-condition
                if(1===1){ //<--------------- разобраться с доступами ----------->
                  if(v1.from) shell.optics.aliases[k1] = v1.from;
                  if(v1.sortable===true){
                    shell.optics.sorters[k1] = _.cloneDeep(state.initialSorter);
                    // {value:null, order:null};
                  }
                  if(v1.filters && !_.isEmpty(v1.filters)){
                    shell.optics.filters[k1] = _.cloneDeep(v1.filters);
                  }
                } else{
                  v1.hidden = true;
                }
              });
            }
            // мержим оптику из query
            const queryOptics = JSON.parse(table.queryOptics ? table.queryOptics : '{}');
            const shelOpticsBeforeMerge = _.cloneDeep(shell.optics)
            shell.optics = _.merge(shell.optics, queryOptics);
            shell.assembled = Date.now();

            if(
                !data
                || !_.isEqual(shelOpticsBeforeMerge, shell.optics)
                || (data && data.version !== currentVersion)
                || shell.id === 0
            ) {
              // update | create
              dispatch('UPDATE_SHELL', shell)
            } else {
              // cached
              commit('SET_SHELL', shell);
              commit('ADD_EVENT', `SHELL ${table.name} FROM DB: ${data.id}`);
            }
          })
          .catch(e=>{
            // eslint-disable-next-line no-console
            console.log(e)
          });
    }
  },
  // eslint-disable-next-line no-unused-vars
  UPDATE_SHELL({commit, rootGetters}, shell){
    // update
    const user = rootGetters['AUTH/GET_USER'];
    const created = shell.id===0;
    const ret = axios.put(`/api/shell/${shell.table}/${user.id}`, {shell: shell} );
    ret.then( resp=>{
      if (created) shell.id = resp.data.id;
      commit('SET_SHELL', shell);
      commit('ADD_EVENT', `SHELL ${shell.table} ${created ? 'CREATED' : 'UPDATED'}: ${shell.id}`);
    }).catch(e=>{
      commit('SET_SHELL', shell);
      commit('ADD_EVENT', `SHELL ${shell.table} DB ERROR: SHELL.ID = 0`);
      // eslint-disable-next-line no-console
      console.log(e)
    });
    return ret;
  },
  // eslint-disable-next-line no-unused-vars
  UPDATE_VALUE({rootGetters}, packet){
    // {table: tab, id: id, column: col, value: val}
    const user = rootGetters['AUTH/GET_USER'];
    return axios.post(`/api/model/update/${packet.model}/${user.id}`, {packet: packet})
  },
};

function actualOptics(optics) {
  let ret = _.cloneDeep(optics);
  const nfs = _.cloneDeep(ret._notForStore);
  Object.keys(ret).map(k=>{
    if (k.charAt(0)==='_') delete ret[k];
    if (nfs.includes(k)) delete ret[k];
  });
  return ret;
}
// eslint-disable-next-line no-unused-vars
function storePrepare(user){
  let sUser = _.cloneDeep(user);
  _.forEach(sUser.options.shells, (table)=>{
    delete table.columns;
    delete table.initial;
  });
  return sUser
}
function checksum(s) {
  var chk = 0x12345678;
  var len = s.length;
  for (var i = 0; i < len; i++) {
    chk += (s.charCodeAt(i) * (i + 1));
  }

  return (chk & 0xffffffff).toString(16);
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
