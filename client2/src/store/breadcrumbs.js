import _ from 'lodash';

const state = {
    items: []
}

const getters = {
    ITEMS: state => state.items
}

const mutations = {
    ITEMS(state, items) {
        state.items = items;
    },
    PUSH(state, item) {
        if (state.items.length > 0) _.last(state.items).disabled = false;
        state.items.push(item);
    },
    POP(state) {
        state.items.pop();
        if (state.items.length > 0) _.last(state.items).disabled = true;
    }
}

const actions = {}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};