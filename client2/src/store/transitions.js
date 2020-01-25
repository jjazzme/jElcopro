import axios from 'axios'

const state = {
    items:[]
}

const getters = {
    ITEMS: state => state.items
}

const mutations = {
    SET(state, items) {
        state.items = items;
    }
}

const actions = {
    GET({ getters, commit }) {
        return new Promise((resolve, reject) => {
            if (getters.ITEMS.length > 0) {
                resolve(getters.ITEMS);
                return
            }
            axios.get('/api2/transitions')
                .then(response => {
                    commit('SET', response.data);
                    resolve(response.data);
                })
                .catch((error) => {
                    commit(
                        'SNACKBAR/SET',
                        { text: error.response.data, color: 'error', snackbar: 'true'},
                        { root: true }
                    );
                    reject(error);
                });
        })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};