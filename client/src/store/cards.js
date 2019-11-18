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
  ADD_TO_INVOICE(state, line){

  },
  SET_INVOICE(state, invoice){state.invoice = invoice}
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
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
