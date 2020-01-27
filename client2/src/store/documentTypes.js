import axios from 'axios'

const state = {
    items: [],
    url: '/api2/document-type'
};

const getters = {
    ITEMS: state => state.items,
    URL: state => state.url,
};

const mutations = {
    ITEMS(state, items) {
        state.items = items
    }
};

const actions = {
    GET({ getters, commit }) {
        return new Promise((resolve, reject) => {
            axios.get(getters.URL, { params: { itemsPerPage: -1 } })
                .then((response) => {
                    commit('ITEMS', response.data);
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
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};