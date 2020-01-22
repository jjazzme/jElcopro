import _ from 'lodash';
const { axios } = window;

const state = {
    name: '',
    data: [],
    cache: [],
};

const getters = {
    NAME: state => state.name,
    URL: state => `api2/${state.name}`,
    DATA: state => state.data,
    CACHE: state => (id) => {
        if (_.isNumber(id)) return _.find(state.cache, { id });
        return state.cache
    }
};

const mutations = {
    CLEAR_DATA(state) {
        state.data = [];
    },

    SET_DATA(state, newData) {
        state.data = newData;
        // _.unionBy(_.isArray(value) ? value : [ value ], state.data, 'id')
    },

    UPDATE_DATA(state, newDataRow) {
        let row = _.find(state.data, { id: newDataRow });
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
    GET_DATA({ getters }, payload) {
        return new Promise((resolve, reject) => {
            axios
                .get(getters.URL, { params: payload })
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => reject(error));
        });
    }
};

export default {
    state,
    getters,
    mutations,
    actions
}