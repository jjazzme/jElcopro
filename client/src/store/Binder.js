import axios from 'axios';
import crypto from 'crypto'
import Shells from "../classLib/DataSource/Shells";
//import Error from '../classLib/Error'

let state = {
  loaders: null,
  token: null,
  requests: [],
  axiosID: 0
};
let getters = {
  // get by key
  cacheGetItem: state => (type, key) => {
    return state.loaders[type].cache.find(item=>_.isEqual(item[0], key));
  },
  // get payload from gash
  cacheGetSetsByHash: state => (type, hash) => state.loaders[type].cacheSets?.find(item=>item[0]===hash),
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
  //
  getAxiosID: state => state.axiosID,
  // make key from payload
  getLoaderKey: state => (type, payload) => state.loaders[type].key(payload),
  // record ttl
  getLoaderTTL: state => type => state.loaders[type].ttl,
  //
  getRequests: state => state.requests,
  getRequestByEid: state => eid => _.find(state.requests, item => item.eid === eid),

  getCacheTableByType: state => type => state.loaders[type].cache.map(item => item[2]),
};
let mutations = {
  addLineToDocument(state, { line, documentId, documentType }) {
    const doc = state.loaders[documentType].cache.find(item => _.isEqual(item[0], documentId))[2];
    doc.documentLines.push(line);
    doc.amount_with_vat += line.amount_with_vat;
  },
  addRequest(state, { uid, source, url, type, eid }) {state.requests.push({ uid, source, url, type, eid })},
  cachesClear(state) { _.forEach(state.loaders, loader => loader.cache = []) },
  incAxiosID(state) { state.axiosID++ },
  removeLineFromDocument(state, { type, documentId, lineId }){
    axios.get(`/api/document/line/delete/${documentId}/${lineId}`)
      .then(()=>{
        const doc = state.loaders[type].cache.find( item => item[0] === documentId )[2];
        const ind = _.findIndex(doc.documentLines, item => item.id === lineId );
        doc.documentLines.splice(ind, 1);
      })
      .catch(err=>console.log(err))
    //const ind = _.findIndex(state.loaders[type].cache, item => item[0] === documentId )
    //delete doc.documentLines.find( item => item.id === lineId )

  },
  removeRequest(state, uid) {
    const ind = _.findIndex(state.requests, item => item[0] === uid );
    state.requests.splice(ind, 1);
  },
  setLoaders(state, val) { state.loaders = val },
  upsertItemToCache(state, {type, key, data}) {
    const cache = state.loaders[type].cache;
    const item = cache.find(item => _.isEqual(item[0], key));
    if (item) {
      const ind = cache.indexOf(item);
      //TODO: следить за поведением
      data = _.mergeWith( item[2], data, (o,s) => { if (_.isArray(o)) {return s} });
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
  addLineToDocument({ commit }, { priceLine, ourPrice, documentId, documentType }){
    axios.post('/api/docline/0', { priceLine, ourPrice, documentId })
      .then(ans => {
        commit('addLineToDocument', { line: ans.data, documentId, documentType })
      });
  },
  getByOptics({ getters, commit }, { type, payload }) {
    // payload = {optics, params, eid}
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
            if (ttl >= 0){
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
            }
            else resolve(ans)
          })
          .catch(err => resolve(null));
      }
    });
  },
  getCardsInvoice() {},
  getItem({getters, commit}, {type, payload}) {
    return new Promise((resolve)=>{
      const key = getters['getLoaderKey'](type, payload);
      let data = getters['cacheGetItem'](type, key);
      const ttl = getters['getLoaderTTL'](type);
      let check = true;
      if (payload.check) {
        _.forEach(payload.check, field => {
          if (data && !data[2][field]) check = false;
        })
      }
      if (data && check && data[1] + ttl > Date.now()) {
        resolve(data[2])
      } else {
        const loader = getters['executorItemLoader'](type, key);
          loader
            .then(ans=>{
              data = ans.data;
              commit('upsertItemToCache', {type, key, data});
              resolve(data);
            })
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
  saveItem({getters, commit}, {type, payload}) {
    return new Promise((resolve)=>{
      const key = getters['getLoaderKey'](type, payload);
      const current = getters['cacheGetItem'](type, key);
      if ((!current && payload) || !_.isEqual(current[2], payload)) {
        const loader = getters['executorItemSave'](type, payload);
        loader
          .then(ans => {
            commit('upsertItemToCache', {type: type, key: key, data: ans.data});
            resolve(ans.data);
          })
      }
      else {
        commit('upsertItemToCache', {type: type, key: key, data: payload});
        resolve(payload);
      }
    });
  },
  /*
  setBinderDefaults({rootGetters}, {ticket}){
    if (!ticket) ticket = rootGetters['User/getTicket'];
    if (ticket && ticket.token_type === 'Bearer' && ticket.expires_in > Date.now()) binder.defaults.headers.common['Authorization'] = `Bearer ${ticket.access_token}`;
    else delete binder.defaults.headers.common['Authorization'];
  },
   */
};

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