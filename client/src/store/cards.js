import axios from 'axios';

let state = {
  invoice: null,
  orders: [],
};
let getters = {
  GET_INVOICE: state => state.invoice,
  GET_ORDERS: state => state.orders,
};
let mutations = {
  ADD_LINE_TO_INVOICE(state, line){state.invoice.documentLines.push(line);},
  SET_INVOICE(state, invoice){state.invoice = invoice;},
  SET_ORDER(state, order){
    state.orders.splice(_.findIndex(state.orders, item=>order.sellerable_id===item.sellerable_id), 1, order)
  },
  ORDER_REMOVE(state, id){
    state.orders.splice(_.findIndex(state.orders, item=>id===item.id), 1)
  },
};
let actions = {
  LOAD_CARDS({state}){

  },
  ADD_LINE_TO_INVOICE({getters, commit, rootGetters}, priceLine){
    const user = rootGetters['AUTH/GET_USER'];
    axios.put(`/api/invoice/line/add/${getters['GET_INVOICE'].id}/${user.id}`, {priceLine: priceLine})
      .then(ans=>commit('ADD_LINE_TO_INVOICE', ans.data))
      .catch(err=>console.log(err))
  },
  INVOICE_REMOVE({state, commit}){
    commit('SET_INVOICE', null)
  },
  INVOICE_TO_CARD({commit, rootGetters}, id){
    const user = rootGetters['AUTH/GET_USER'];
    axios.get(`/api/invoice/get/${id}/${user.id}`)
      .then(ans=>{
        commit('SET_INVOICE', ans.data)
      })
      .catch(err=>console.log(err))
  },
  ORDER_REMOVE({state, commit}, id){
    commit('ORDER_REMOVE', id)
  },
  ORDER_TO_CARD({commit, rootGetters}, id){
    const user = rootGetters['AUTH/GET_USER'];
    axios.get(`/api/order/get/${id}/${user.id}`)
      .then(ans=>{
        commit('SET_ORDER', ans.data)
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
