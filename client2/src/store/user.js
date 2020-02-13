
const state = {
    data: {
        id: 1,
        email: 'elcopro@gmail.com',
        cards: { "orders": [], "invoice": 2047 }
    },
};

const getters = {
    GET: state => state.data,
    INVOICE: (state, getters, rootState, rootGetters) => {
        const getInvoice = rootGetters['INVOICE/CACHE'];
        return state.data.cards && state.data.cards.invoice
            ? getInvoice(parseInt(state.data.cards.invoice, 0))
            : null
    },
    ORDERS: (state, getters, rootState, rootGetters) => {
        return state.data.cards && state.data.cards.orders
            ? state.data.cards.orders
                .filter((order) => rootGetters['ORDER/CACHE'](parseInt(order, 0)))
                .map((order) => rootGetters['ORDER/CACHE'](parseInt(order, 0)))
            : []
    },
};

const mutations = {
    SET(state, user) {
        state.data = user;
    },
    SET_INVOICE(state, id) {
        state.data.cards.invoice = parseInt(id, 0)
    },
    CLEAR_INVOICE(state) {
        state.data.cards.invoice = null;
    },
    CLEAR_ORDERS(state) {
        state.data.cards.orders = [];
    },
    SET_ORDERS(state, orders) {
        state.data.cards.orders = orders;
    },
    PUSH_ORDER(state, id) {
        state.data.cards.orders.push(parseInt(id,0));
    },
    CHANGE_ORDER(state, payload) {
        state.data.cards.orders.splice(payload.index, 1, parseInt(payload.id,0));
    },
    REMOVE_ORDER(state, id) {
        const index = state.data.cards.orders.indexOf(parseInt(id,0));
        if (index >= 0 ) state.data.cards.orders.splice(index, 1);
    }
};

const actions = {
    async GET({ getters, dispatch }) {
        await dispatch('SET_CARDS');
        return getters.GET;
    },
    async SET_CARDS({ state, dispatch }) {
        if (state.data.cards.invoice) {
            await dispatch('INVOICE/CACHE', parseInt(state.data.cards.invoice, 0), { root: true });
        }
        await Promise.all(
            state.data.cards.orders.map((order) => dispatch('ORDER/CACHE', parseInt(order, 0), { root: true }))
        );
    }
};

export default {
    namespaced: true,
    state,
    getters: getters,
    mutations: mutations,
    actions: actions,
}