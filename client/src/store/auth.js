//import _ from 'lodash'
//import axios from 'axios'


let state = {

};

let getters = {
  GET_USER: () => {return {id:1, name:'Администратор'}},
  GET_STATE: state=> state,
};

let mutations = {

};

let actions = {

};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
