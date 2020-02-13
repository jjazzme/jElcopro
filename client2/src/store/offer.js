// import _ from 'lodash';
import axios from 'axios';

const state = {
    headers: [
        { text: 'Склад', value: 'store_name', sortable: false },
        { text: 'Код', value: 'code', sortable: false },
        { text: 'Дата', value: 'online', sortable: false },
        { text: 'Название', value: 'name', sortable: false },
        { text: 'Производитель', value: 'producer_name', sortable: false },
        { text: 'Корпус', value: 'case', sortable: false },
        { text: 'Упак.', value: 'pack', sortable: false },
        { text: 'Кратно', value: 'multiply', sortable: false },
        { text: 'Мин.', value: 'min', sortable: false },
        { text: 'Макс.', value: 'max', sortable: false },
        { text: 'Есть', value: 'ballance', sortable: false },
        { text: 'Выписать', value: 'quantity', sortable: false },
        { text: 'Цена ₽', value: 'price', sortable: false },
        { text: 'Сумма ₽', value: 'sum', sortable: false },
        { text: 'Цена $', value: 'price_usd', sortable: false },
        { text: 'Сумма $', value: 'sum_usd', sortable: false },
        { text: 'Кл. ₽', value: 'for_all_price_rub', sortable: false },
        { text: 'Кл. $', value: 'for_all_price_usd', sortable: false },
        { text: 'НДС', value: 'vat', sortable: false },
        { text: 'Срок', value: 'average_days', sortable: false },
    ],
    name: 'price',
    search: '',
    items: [],
    keyType: Number,
    quantity: 1,
    breadcrumb: {
        text: 'ПРЕДЛОЖЕНИЯ',
        to: { name: 'offers' },
        link: true,
        disabled: true,
    },
};

const getters = {
    BREADCRUMB: state => state.breadcrumb,
    NAME: state => state.name,
    KEYTYPE: state => state.keyType,
    URL: state => `/api2/${state.name}`,
    ITEMS: state => state.items,
    HEADERS: state => state.headers,
    QUANTITY: state => state.quantity,
};

const mutations = {
    SET_QUANTITY(state, quantity) {
        state.quantity = parseInt(quantity);
    },
    SET_SUM(state, rates) {
        state.items = state.items.map(value => {
            value.price = parseFloat(value.our_price) * parseFloat(rates(value.currency_id));
            let q = parseInt(state.quantity);
            if (q > parseInt(value.ballance)) {
                q = parseInt(value.ballance)
            }
            if (q <= parseInt(value.min)){
                q = parseInt(value.min)
            }
            if (q % parseInt(value.multiply) !== 0) {
                q = q + parseInt(value.multiply) - (q % parseInt(value.multiply))
            }
            value.order_quantity = q;
            value.sum = q * parseFloat(value.price);

            return value
        })
    },
};

const actions = {
    GET_ITEMS({getters, commit}, payload) {
        return new Promise((resolve, reject) => {
            axios
                .get(getters.URL, {params: payload})
                .then((response) => {
                    // eslint-disable-next-line no-debugger
                    // commit('SET_CACHE', response.data.rows);
                    resolve(response);
                })
                .catch((error) => {
                    commit(
                        'SNACKBAR/SET',
                        {text: error.response.data, color: 'error', snackbar: 'true'},
                        {root: true}
                    );
                    reject(error);
                });
        });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
}