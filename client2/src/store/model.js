import _ from 'lodash';
const { axios } = window;

const state = {
    name: '',
    keyType: Number,
    items: [],
    cache: [],
    headers: [],
    breadcrumb: {}
};

const getters = {
    BREADCRUMB: state => state.breadcrumb,
    NAME: state => state.name,
    KEYTYPE: state => state.keyType,
    URL: state => `/api2/${state.name}`,
    ITEMS: state => state.items,
    HEADERS: state => state.headers,
    CACHE: state => (id) => {
        if (_.isNumber(id) || state.keyType === String) return _.find(state.cache, { id });
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
        let row = _.find(state.items, { id: newDataRow.id });
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
    REMOVE_ITEM({ getters, commit }, id) {
        return new Promise((resolve, reject) => {
            axios.delete(getters.URL + '/' + id)
                .then((response) => {
                    commit(
                        'SNACKBAR/SET',
                        {
                            text: getters.NAME + ' with id ' + id + ' was deleted.',
                            color: 'success',
                            snackbar: true,
                            timeout: 3000
                        },
                        { root: true }
                    );
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
        const method = item.id === 0 ? 'post' : 'put';
        return new Promise((resolve, reject) => {
            axios[method](getters.URL + '/' + (item.id === 0 ? '' : item.id), item)
                .then(response => {
                    commit('SET_CACHE', response.data);
                    commit(
                        'SNACKBAR/SET',
                        {
                            text: getters.NAME + ' with id ' + item.id + ' was saved.',
                            color: 'success',
                            snackbar: true,
                            timeout: 3000
                        },
                        { root: true }
                    );
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
    CACHE({ getters, dispatch }, id) {
        return new Promise((resolve, reject) => {
            if (getters.CACHE(id)) {
                resolve(getters.CACHE(id));
                return;
            }
            dispatch('GET_ITEM', id).then(response => resolve(response)).catch(error => reject(error))
        });
    },
    GET_ITEM({ getters, commit }, id) {
         return new Promise((resolve, reject) => {
            axios
                .get(getters.URL + '/' + id)
                .then(response => {
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