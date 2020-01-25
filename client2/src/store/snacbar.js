const state = {
    text: '',
    snackbar: false,
    color: 'info',
    timeout: 60000,
    multi: true,
};

const getters = {
    TEXT: state => state.text,
    SNACKBAR: state => state.snackbar,
    COLOR: state => state.color,
    TIMEOUT: state => state.timeout,
    MULTI: state => state.multi
};

const mutations = {
    SET(state, payload) {
        Object.assign(state, payload)
    },
    SNACKBAR(state, value) {
        state.snackbar = value;
    }
};

const actions = {}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};