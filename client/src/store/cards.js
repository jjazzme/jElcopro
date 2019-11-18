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
  SET_INVOICE(state, invoice){state.invoice = invoice;}
};
let actions = {
  LOAD_CARDS({state}){

  },
  INVOICE_TO_CARD({state, getters, commit, rootGetters}, id){
    const user = rootGetters['AUTH/GET_USER'];
    axios.get(`/api/invoice/get/${id}/${user.id}`)
      .then(ans=>{
        commit('SET_INVOICE', ans.data)
      })
      .catch(err=>console.log(err))
  },
  ADD_LINE_TO_INVOICE({state, getters, commit, rootGetters}, priceLine){
    const user = rootGetters['AUTH/GET_USER'];
    axios.put(`/api/invoice/line/add/${getters['GET_INVOICE'].id}/${user.id}`, {priceLine: priceLine})
      .then(ans=>commit('ADD_LINE_TO_INVOICE', ans.data))
      .catch(err=>console.log(err))
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
