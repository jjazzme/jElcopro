import axios from 'axios';
import crypto from 'crypto'
import Error from '../classLib/Error'

let state = {
  loaders: {
    Product: {
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        `/api/model/get/Product`,
        {optics:payload.optics, params:payload.params}),
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
    Invoice: {
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        `/api/model/get/Invoice`,
        {optics:payload.optics, params:payload.params}),
      itemLoader: (key)=>axios.get(`/api/invoice/get/${key}`),
      ttl: 3600e3*24,
      cache: [], // [[id, updated, {}], [id, updated, {}]]
      cacheSets: [], // [[hash, updated, [ids]], [hash, updated, [ids]]
    },
    Order: {
      key: item=>item.id,
      byOpticsLoader: (payload)=>axios.put(
        `/api/model/get/Order`,
        {optics:payload.optics, params:payload.params}),
      itemLoader: (key)=>axios.get(`/api/order/get/${key}`),
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
    DocumentLine: {
      key: item=>item.id,

    },
  },
};

let getters = {
  // get by key
  cacheGetItem: state => (type, key) => {
    return state.loaders[type].cache.find(item=>_.isEqual(item[0], key));
  },

  // get payload from gash
  cacheGetSetsByHash: state => (type, hash) => state.loaders[type].cacheSets.find(item=>item[0]===hash),
  // execute by optics payload
  executorByOpticsLoader: state => (type, payload) => {
    //payload.optics = actualOptics(payload.optics);
    return state.loaders[type].byOpticsLoader(payload);
  },
  // execute loader promise for item
  executorItemLoader: state => (type, key) => state.loaders[type].itemLoader(key),
  // execute save promise
  executorItemSave: state => (type, payload) => state.loaders[type].itemSave(payload),
  // make page from set of keys
  formingSetFromCache: state => (type, keys) => {
    let ret = [];
    keys.forEach(key=>ret.push(state.loaders[type].cache.find(item=>item[0]===key)[2]));
    return ret;
  },
  // make key from payload
  getLoaderKey: state => (type, payload) => state.loaders[type].key(payload),
  // record ttl
  getLoaderTTL: state => type => state.loaders[type].ttl,
};

let mutations = {
  removeLineFromDocument(state, { type, documentId, lineId }){
    axios.get(`/api/document/line/delete/${documentId}/${lineId}`)
      .then(ans=>{
        const doc = state.loaders[type].cache.find( item => item[0] === documentId )[2];
        const ind = _.findIndex(doc.documentLines, item => item.id === lineId );
        doc.documentLines.splice(ind, 1);
      })
      .catch(err=>console.log(err))
    //const ind = _.findIndex(state.loaders[type].cache, item => item[0] === documentId )
    //delete doc.documentLines.find( item => item.id === lineId )

  },
  upsertItemToCache(state, {type, key, data}) {
    const cache = state.loaders[type].cache;
    const item = cache.find(item => _.isEqual(item[0], key));
    if (item) {
      const ind = cache.indexOf(item);
      cache.splice(ind, 1);
    }
    cache.unshift([key, Date.now(), data])
  },
  upsertSetToCache(state, {type, hash, data}) {
    const cache = state.loaders[type].cacheSets;
    const item = cache.find(item => item[0] === hash);
    if (item) {
      const ind = cache.indexOf(item);
      cache.splice(ind, 1);
    }
    cache.unshift([hash, Date.now(), data])
  },
  clearCacheSets(state, type) { state.loaders[type].cacheSets = []; },
};

let actions = {
  getByOptics({getters, commit}, {type, payload}) {
    // payload = {optics, params}
    // TODO: make a ROW notes
    const hash = getHash(payload);
    return new Promise((resolve, reject) => {
      const cached = getters['cacheGetSetsByHash'](type, hash);
      const ttl = getters['getLoaderTTL'](type);
      let cacheItem = null;
      let dataset = [];

      if(cached && cached[1] + ttl > Date.now()) {
        if (Array.isArray(cached[2])) {
          cacheItem = getters['formingSetFromCache'](type, cached[2]);
        } else {
          dataset = getters['formingSetFromCache'](type, cached[2]._rows);
          cacheItem = _.cloneDeep(cached[2]);
          cacheItem.rows = dataset;
        }
        resolve(cacheItem)
      } else {
        const loader = getters['executorByOpticsLoader'](type, payload);
        loader
          .then(ans=>{
            if (Array.isArray(ans.data)) {
              dataset = ans.data;
              cacheItem = _.map(dataset, item=>getters['getLoaderKey'](type, item));
            } else {
              dataset = ans.data.rows;
              cacheItem = _.cloneDeep(ans.data);
              cacheItem._rows = _.map(dataset, item=>getters['getLoaderKey'](type, item))
              ans.data._rows = cacheItem._rows;
              delete cacheItem.rows;
            }

            dataset.forEach(data=>{
              const key = getters['getLoaderKey'](type, data);
              //keys.push(key);
              commit('upsertItemToCache', {type, key, data})
            });
            commit('upsertSetToCache', {type: type, hash: hash, data: cacheItem});
            resolve(ans.data)
          })
          .catch(err => new Error(err));
      }
    });
  },
  getItem({getters, commit}, {type, payload}) {
    return new Promise((resolve, reject)=>{
      const key = getters['getLoaderKey'](type, payload);
      let data = getters['cacheGetItem'](type, key);
      const ttl = getters['getLoaderTTL'](type);
      if (data && data[1] + ttl > Date.now()) {
        resolve(data[2])
      } else {
        const loader = getters['executorItemLoader'](type, key);
          loader
            .then(ans=>{
              data = ans.data;
              commit('upsertItemToCache', {type, key, data});
              resolve(data);
            })
            .catch(err => new Error(err));
      }
    });
  },
  makeTransfer({commit}, optics){
    const ret = axios.post('/api/document/createtransfer', {optics: optics});
    ret
      .then(ans => {
        const inst = ans.data
        if ( optics.type === 'in' ) {
          commit('upsertItemToCache', {type: 'TransferIn', key: inst.id, data: inst});
          commit('clearCacheSets', 'TransferIn');
        }
        else {
          commit('upsertItemToCache', {type: 'TransferOut', key: inst.id, data: inst});
          commit('clearCacheSets', 'TransferOut');
        }
      });
    return ret;
  },
  makeTransition({},{ type, id, transition, own }){
    return new Promise((resolve, reject) => {
      return axios.get(`/api/document/dotransition/${type}/${id}/${transition}/${own}`)
        .then(ans =>
          resolve(ans.data))
        .catch(err => {
          return reject(err)
        })
    });
  },
  removeLineFromDocument({commit}, { type, documentId, lineId }){
    commit('removeLineFromDocument', { type, documentId, lineId });
  },
  saveItem({state, getters, commit}, {type, payload}) {
    return new Promise((resolve, reject)=>{
      const key = getters['getLoaderKey'](type, payload);
      const current = getters['cacheGetItem'](type, key);
      if ((!current && payload) || !_.isEqual(current[2], payload)) {
        const loader = getters['executorItemSave'](type, payload);
        loader
          .then(ans => {
            commit('upsertItemToCache', {type: type, key: key, data: ans.data});
            resolve(ans.data);
          })
          .catch(err => new Error(err))
      }
      else {
        commit('upsertItemToCache', {type: type, key: key, data: payload});
        resolve(payload);
      }
    });
  },

};

const type = Object.freeze({});

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

function getHash(payload) {
  return crypto.createHash('md5')
    .update(JSON.stringify(payload.optics))
    .digest('hex');
}

/*
function actualOptics(optics) {
  let ret = _.cloneDeep(optics);
  const nfs = _.cloneDeep(ret._notForStore);
  if (nfs){
    Object.keys(ret).map(k=>{
      if (nfs.includes(k)) delete ret[k];
    });
  }
  Object.keys(ret).map(k=>{
    if (k.charAt(0)==='_') delete ret[k];
  });
  return ret;
}
 */