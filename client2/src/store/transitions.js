import axios from 'axios'

const state = {
    items:[],
    url: '/api2/transitions/',
};

const getters = {
    ITEMS: state => state.items,
    URL: state => state.url,
    MODEL: () => ({
        Invoice: 'INVOICE',
        Order: 'ORDER',
        TransferOut: 'TRANSFER-OUT',
        TransferIn: 'TRANSFER-IN',
    })
};

const mutations = {
    SET(state, items) {
        state.items = items;
    }
};

const actions = {
    GET({ getters, commit }) {
        return new Promise((resolve, reject) => {
            if (getters.ITEMS.length > 0) {
                resolve(getters.ITEMS);
                return
            }
            axios.get(getters.URL)
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
    },
    EXECUTE({ getters, commit, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            axios.put(getters.URL + payload.id, payload)
                .then(() => {
                    dispatch(getters.MODEL[payload.Model] + '/GET_ITEM', payload.id, { root: true })
                        .then(response => resolve(response))
                        .catch(error => reject(error))
                })
                .catch((error) => {
                    commit(
                        'SNACKBAR/SET',
                        { text: error.response.data, color: 'error', snackbar: 'true'},
                        { root: true }
                    );
                    reject(error);
                });
        });
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};