import axios from 'axios';

let state = {
  user: null,
  lastUserActivity: null,
  savingCards: false,
};

let getters = {
  GET_USER: state => state.user,
};

let mutations = {
  SET_LAST_USER_ACTIVITY(state){
    state.lastUserActivity = Date.now();
  },
  SET_SAVING_CARDS(state, status){state.savingCards = !!status},
  SET_USER(state, user){
    state.user = user;
    state.lastUserActivity = Date.now();
  },
};

let actions = {
  //AUTHENTICATE({state}, {login, password, cookie}){},
  AUTO_LOGIN({commit}){
    axios.get('/api/user/get/self')
      .then(ans=>commit('SET_USER', ans.data))
  },
  SAVE_CARDS({getters, commit}, cards){
    const user = getters['GET_USER'];
    commit('SET_SAVING_CARDS', true);
    const ret = axios.put(`/api/user/cards/set/${user.id}`, {cards: cards});
    ret
      .catch(err=>{
        console.log(err);
        commit('SET_SAVING', false);
      })
      .finally(()=>{commit('SET_SAVING_CARDS', false);})
    return ret;
  },
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
