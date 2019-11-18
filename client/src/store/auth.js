let state = {
  user:{}
};

let getters = {
  GET_USER: () => {return {id:1, name:'Администратор', skills: {sales: 0, computer: 0, interface: 0}}},
  GET_STATE: state=> state,
};

let mutations = {

};

let actions = {
  AUTHENTICATE({state}, {login, password, cookie}){

  }
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
