import axios from 'axios';

let state = {
  cards: {
    invoice: null,
    orders:[],
  },
  documents:[],
};
let getters = {
  GET_CARDS: state => {return state.cards},
  GET_DOCUMENT_BY_ID: state => id => state.documents.filter(function(doc){return doc.id === id})[0],
  GET_GOODS_COUNT_FROM_INVOICE: (state, getters) => goodId => {
    if (!state.cards.invoice) return null;
    const doc = getters['GET_DOCUMENT_BY_ID'](state.cards.invoice);
    const lines = doc.documentLines.filter(function(line){return line.good_id === goodId});
    return _.sumBy(lines, 'quantity');
  },
  GET_GOODS_COUNT_FROM_ORDER: state =>goodId => {
    if (state.cards.orders.length === 0) return null;
    return null;
  },
  GET_INVOICE: state => {return state.cards.invoice ? state.documents.filter(function(doc){return doc.document_type_id === 'invoice'})[0] : null;},
  GET_ORDERS: state =>  state.documents.filter(function(doc){return doc.document_type_id === 'order'}),

};
let mutations = {
  ADD_LINE(state, line){
    const doc = state.documents.filter(function(doc){return doc.id === line.document_id})[0];
    doc.documentLines.push(line);
  },
  ADD_DOCUMENT(state, doc){state.documents.push(doc)},
  DOCUMENTS_CLEAR(state){state.documents=[]},
  SET_CARDS(state, cards){state.cards = cards},
  SET_INVOICE(state, invoice){ // null for remove
    if(!invoice){
      // remove
      if(state.cards.invoice){
        const ind = state.documents.filter(function(doc){return doc.id === state.cards.invoice})[0];
        state.documents.splice(ind, 1)
      }
      state.cards.invoice = null;
    } else {
      if(state.cards.invoice){
        const ind = state.documents.filter(function(doc){return doc.id === state.cards.invoice})[0];
        state.documents.splice(ind, 1, invoice)
      } else state.documents.push(invoice);
      state.cards.invoice = invoice.id;

    }
  },
  SET_ORDER(state, order){
    const ind = _.findIndex(state.documents, item=>order.sellerable_id===item.sellerable_id);
    if (ind<0){
      state.cards.orders.push(order.id);
      state.documents.push(order)
    } else{
      const id = state.documents[ind].id;
      state.cards.orders.splice(state.cards.orders.indexOf(id), 1, order.id);
      state.documents.splice(ind, 1, order);
    }
  },
  ORDER_REMOVE(state, id){
    state.cards.orders.splice(state.cards.orders.indexOf(id), 1);
    state.documents.splice(_.findIndex(state.documents, item=>id===item.id), 1)
  },
};
let actions = {

  ADD_LINE_TO_DOCUMENT({getters, commit, rootGetters}, {priceLine, type}){
    const user = rootGetters['AUTH/GET_USER'];

    let id = 0;
    if ( type === 'invoice' ) id = getters['GET_INVOICE'].id
    else if ( type === 'order' ) {
      const sid = priceLine.company_id;
      id = _.find(getters['GET_ORDERS'], order=>order.sellerable_id === sid).id;
    }

    axios.put(`/api/document/line/add/${id}/${user.id}`, {priceLine: priceLine})
      .then(ans=>commit('ADD_LINE', ans.data))
      .catch(err=>console.log(err))
  },
  INVOICE_REMOVE({getters, commit, dispatch}){
    commit('SET_INVOICE', null);
    dispatch('AUTH/SAVE_CARDS', getters['GET_CARDS'], {root: true});
  },
  INVOICE_TO_CARD({getters, commit, dispatch, rootGetters}, id){
    const user = rootGetters['AUTH/GET_USER'];
    axios.get(`/api/invoice/get/${id}/${user.id}`)
      .then(ans=>{
        commit('SET_INVOICE', ans.data);
        dispatch('AUTH/SAVE_CARDS', getters['GET_CARDS'], {root: true});
      })
      .catch(err=>console.log(err))
  },
  LOAD_CARDS({commit, rootState}){
    let cards = rootState.AUTH.user.cards;
    commit('DOCUMENTS_CLEAR');
    if (cards.invoice) axios.get(`/api/invoice/get/${cards.invoice}/:userID`)
      .then(ans=>commit('ADD_DOCUMENT', ans.data));
    _.forEach(cards.orders, order=>{
      axios.get(`/api/order/get/${order}/:userID`)
        .then(ans=>commit('ADD_DOCUMENT', ans.data));
    });
    commit('SET_CARDS', cards);
  },
  ORDER_REMOVE({getters, commit, dispatch}, id){
    commit('ORDER_REMOVE', id);
    dispatch('AUTH/SAVE_CARDS', getters['GET_CARDS'], {root: true});
  },
  ORDER_TO_CARD({getters, commit, dispatch, rootGetters}, id){
    const user = rootGetters['AUTH/GET_USER'];
    axios.get(`/api/order/get/${id}/${user.id}`)
      .then(ans=>{
        commit('SET_ORDER', ans.data);
        dispatch('AUTH/SAVE_CARDS', getters['GET_CARDS'], {root: true});
      })
      .catch(err=>console.log(err))
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
