import axios from 'axios';

let state = {
  user: null,
  lastUserActivity: null,
  savingCards: false,
  token: null,
};

let getters = {
  getUser: state => state.user,
};

let mutations = {
  setLastUserActivity(state){
    state.lastUserActivity = Date.now();
  },
  setSavingCards(state, status){state.savingCards = !!status},
  setUser(state, user){
    state.user = user;
    state.lastUserActivity = Date.now();
  },
};

let actions = {
  autoLogin({ commit, dispatch }){
    dispatch('Binder/getItem', { type: 'User', payload: {id: 0} }, { root: true })
      .then(ans => console.log(ans))
  },
  saveCards({ getters, commit }, cards){
    const user = getters['getUser'];
    commit('setSavingCards', true);
    const ret = axios.put(`/api/user/cards/set/${user.id}`, {cards: cards});
    ret
      .catch(err=>{
        console.log(err);
        commit('setSavingCards', false);
      })
      .finally(()=>{commit('setSavingCards', false);});
    return ret;
  },
  logoff({ commit }){
    commit('setUser', null);
  },
  login({ commit }, { username, password }){
    debugger
    const grant_type = 'password';
    const ret = axios.post('/api/auth/login', { grant_type: 'password', username: username, password: password });
    ret
      .then(ans => {
        console.log(ans)
      })
      .catch(err => {
        debugger
        console.log(err)
      });
    return ret;
  },
  logout({ commit }){
    axios.post('')
      .then(ans => {
        console.log(ans)
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
