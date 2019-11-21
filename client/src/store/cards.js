import axios from 'axios';

let state = {
  cards: {},
};
let getters = {
  GET_INVOICE: state => state.cards.invoice,
  GET_ORDERS: state => state.cards.orders,
  GET_CARDS: state => {return state.cards},
};
let mutations = {
  ADD_LINE_TO_INVOICE(state, line){state.cards.invoice.documentLines.push(line);},
  SET_CARDS(state, cards){state.cards = cards},
  SET_INVOICE(state, invoice){state.cards.invoice = invoice;},
  SET_ORDER(state, order){
    const ind = _.findIndex(state.cards.orders, item=>order.sellerable_id===item.sellerable_id);
    if (ind<0){
      state.cards.orders.push(order);
    } else{
      state.cards.orders.splice(ind, 1, order);
    }
  },
  ORDER_REMOVE(state, id){state.cards.orders.splice(_.findIndex(state.cards.orders, item=>id===item.id), 1)},
};
let actions = {

  ADD_LINE_TO_INVOICE({getters, commit, rootGetters}, priceLine){
    const user = rootGetters['AUTH/GET_USER'];
    axios.put(`/api/invoice/line/add/${getters['GET_INVOICE'].id}/${user.id}`, {priceLine: priceLine})
      .then(ans=>commit('ADD_LINE_TO_INVOICE', ans.data))
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
    commit('SET_CARDS', rootState.AUTH.user.cards);
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
