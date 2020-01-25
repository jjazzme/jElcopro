import _ from 'lodash';
const { axios } = window;

const state = {
    name: '',
    items: [],
    cache: [],
    headers: [],
    breadcrumb: {}
};

const getters = {
    BREADCRUMB: state => state.breadcrumb,
    NAME: state => state.name,
    URL: state => `/api2/${state.name}`,
    ITEMS: state => state.items,
    HEADERS: state => state.headers,
    CACHE: state => (id) => {
        if (_.isNumber(id)) return _.find(state.cache, { id });
        return state.cache
    }
};

const mutations = {
    CLEAR_ITEMS(state) {
        state.items = [];
    },

    SET_ITEMS(state, newData) {
        state.items = newData;
        // _.unionBy(_.isArray(value) ? value : [ value ], state.items, 'id')
    },

    UPDATE_ITEM(state, newDataRow) {
        let row = _.find(state.items, { id: newDataRow });
        if (row) row = newDataRow;
    },

    CLEAR_CACHE(state) {
        state.cache = [];
    },

    SET_CACHE(state, value) {
        state.cache = _.unionBy(_.isArray(value) ? value : [ value ], state.cache, 'id')
    },
};

let actions = {
    GET_ITEMS({ getters, commit }, payload) {
        return new Promise((resolve, reject) => {
            axios
                .get(getters.URL, { params: payload })
                .then((response) => {
                    // eslint-disable-next-line no-debugger
                    commit('SET_CACHE', response.data.rows);
                    resolve(response);
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
    },
    UPDATE_ITEM({ getters, commit }, payload) {
        const { item } = payload;
        return new Promise((resolve, reject) => {
            axios
                .put(getters.URL + '/' + item.id, item)
                .then(response => {
                    commit('SET_CACHE', response.data);
                    resolve(response)
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
    },
    CACHE({ getters, commit }, id) {
        return new Promise((resolve, reject) => {
            if (getters.CACHE(id)) {
                resolve(getters.CACHE(id));
                return;
            }
            axios
                .get(getters.URL + '/' + id)
                .then(response => {
                    // eslint-disable-next-line no-debugger
                    debugger;
                    commit('SET_CACHE', response.data);
                    resolve(response.data)
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
    state,
    getters,
    mutations,
    actions
}