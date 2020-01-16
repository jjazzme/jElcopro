import axios from 'axios';

let state = {
  user: null,
  lastUserActivity: null,
  savingCards: false,
  // { access_token, expires_in, token_type } token/ticks/Bearer
  ticket: null,
};

let getters = {
  getUser: state => {
    const user = state.user;
    if (user && _.isEmpty(user.cards)) user.cards = { orders: [], invoice: null };
    return user;
  },
  getTicket: state => state.ticket,
  orderIsPresent: state => id => state.user.cards.orders.includes(id),
};

let mutations = {
  setLastUserActivity(state){
    state.lastUserActivity = Date.now();
  },
  setSavingCards(state, status){state.savingCards = !!status},
  setTicket(state, ticket){
    state.ticket = ticket;
  },
  setUser(state, user){
    state.user = user;
    state.lastUserActivity = Date.now();
  },
  setInvoice(state, id){ state.user.cards.invoice = id },
  setOrder(state, id) {
    // если id есть, то remove, если нет, то add
    const orders = state.user.cards.orders;
    if(orders.includes(id)) {
      orders.splice(orders.indexOf(id), 1);
    } else {
      orders.unshift(id);
    }
  },
};

let actions = {
  // TODO: переделать управление картами в части загрузок
  autoLogin({ commit, dispatch }){
    const ret = dispatch('Binder/getItem', { type: 'User', payload: {id: 0} }, { root: true });
    ret
      .then(user => {
        if (user) {
          commit('setUser', user);
          commit('setTicket', JSON.parse(localStorage.getItem('ticket')));
        }
        else {
          commit('setUser', null);
          commit('setTicket', null);
        }
      })
    return ret;
  },
  saveCards({ getters, commit }){
    const user = getters['getUser'];
    return axios.post(`/api/user/${user.id}`, {cards: user.cards});
  },
  invoiceRemove({commit, dispatch}){
    return new Promise(resolve => {
      commit('setInvoice', null);
      dispatch('saveCards').then(()=>resolve(true))
    })
  },
  invoiceAdd({commit, dispatch}, id){
    return new Promise(resolve => {
      commit('setInvoice', id);
      dispatch('saveCards').then(()=>resolve(true))
    })
  },
  orderAddRemove({commit, getters, dispatch}, id){
    return new Promise(resolve => {
      commit('setOrder', id);
      dispatch('saveCards').then(()=>resolve(true))
    })
  },
  logoff({ commit }){
    commit('setUser', null);
  },
  login({ commit, dispatch }, { username, password }){
    const grant_type = 'password';
    const ret = axios.post('/api/auth/login', { grant_type: 'password', username: username, password: password });
    ret
      .then(ans => {
        const ticket = ans.data;
        // { access_token, expires_in, token_type } token/ticks/Bearer
        commit('setTicket', ticket);
        localStorage.setItem('ticket', JSON.stringify(ticket));
        //dispatch('Binder/setBinderDefaults', { ticket }, { root: true });
        dispatch('autoLogin');
      })
      .catch(err => {
        console.log(err)
      });
    return ret;
  },
  logout({ getters, commit, dispatch }){
    let ticket = getters['getTicket']
    axios.get('/api/auth/logout', { headers: {"Authorization" : `Bearer ${ticket.access_token}`} })
      .then(ans => {
        ticket = null;
        commit('setTicket', ticket);
        localStorage.removeItem('ticket');
        //dispatch('Binder/setBinderDefaults', { ticket }, { root: true });
        commit('setUser', null);
      })
      .catch(err => {
        console.log(err)
      })
  },
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
