import axios from 'axios';

const state = {
    items: new Map(),
    date: null,
};

const getters = {
    ITEMS: state => id => id ? state.items[id] : state.items,
    DATE: state => state.date,
};

const mutations = {
    SET_ITEMS(state, newData) {
        const newItems = new Map();
        newData.forEach((v) => {
            newItems[v.currency_id] = v.rate;
        });
        state.items = newItems;
    },

    SET_DATE(state, newDate) {
        state.date = newDate;
    }
};

const actions = {
    SET_DATE({ state, getters, commit }, newDate) {
        return new Promise((resolve, reject) => {
            if (state.date !== newDate) {
                axios.get('/api2/currency-rate', { params: { date: newDate } })
                    .then((response) => {
                        commit('SET_DATE', newDate);
                        commit('SET_ITEMS', response.data);
                        resolve(getters.ITEMS);
                    })
                    .catch((error) => {
                        commit(
                            'SNACKBAR/SET',
                            { text: error.response.data, color: 'error', snackbar: 'true'},
                            { root: true }
                        );
                        reject(error);
                    });
            } else {
                resolve(getters.ITEMS);
            }
        })
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
}