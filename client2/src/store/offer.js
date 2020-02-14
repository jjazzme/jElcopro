import _ from 'lodash';
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
    items: new Map(),
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
    FILTRED_ITEMS: state => payload => {
        // eslint-disable-next-line no-debugger
        //debugger;
        let ret = [];
        for (let i = 0; i < state.items.length; i++) {
            const price = state.items[i];
            if (
                !(payload.more_or_equal && price.quantity < state.quantity) &&
                (price.quantity <= price.max) &&
                (price.ballance > 0) &&
                ((payload.name && price.name.indexOf(payload.name) >= 0) || !payload.name) &&
                (
                    (!_.isEmpty(payload.producers) && payload.producers.indexOf(price.producer_name) >=0)
                    || _.isEmpty(state.producers)
                ) &&
                (
                    (!_.isEmpty(payload.cases) && payload.cases.indexOf(price.case) >= 0)
                    || _.isEmpty(payload.cases)
                ) &&
                (
                    ( !_.isEmpty(payload.stores) && payload.stores.indexOf(price.store_id) >= 0 )
                    || _.isEmpty(payload.stores)
                )
            ) {
                price.original_index = i;
                ret.push(price);
            }
        }
        return ret
    }
};

const mutations = {
    SET_ITEMS(state, items) {
        state.items = items;
    },
    SET_SEARCH(state, name) {
        state.search = name;
    },
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
            value.quantity = q;
            value.sum = q * parseFloat(value.price);

            value.price_usd = value.price / parseFloat(rates('R01235'));
            value.sum_usd = value.sum / parseFloat(rates('R01235'));

            value.for_all_price_rub = value.for_all_price * parseFloat(rates(value.currency_id));
            value.for_all_price_usd = value.for_all_price_rub / parseFloat(rates('R01235'));

            return value
        })
    },
};

const actions = {
    GET_ITEMS({ getters, commit, rootGetters }, payload) {
        return new Promise((resolve, reject) => {
            if (payload.filters.name.length < 4 || payload.filters.name === state.search) {
                resolve(getters.ITEMS);
            } else {
                axios
                    .get(getters.URL, {params: payload})
                    .then((response) => {
                        commit('SET_SEARCH', payload.filters.name);
                        commit('SET_ITEMS', response.data);
                        commit('SET_SUM', rootGetters['CURRENCY-RATE/ITEMS']);
                        resolve({ data: { rows: getters.ITEMS, count: getters.ITEMS.length } });
                    })
                    .catch((error) => {
                        commit(
                            'SNACKBAR/SET',
                            {text: error.response.data, color: 'error', snackbar: 'true'},
                            {root: true}
                        );
                        reject(error);
                    });
            }
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