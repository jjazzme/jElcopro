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
    stores:[],
    counter: 0,
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
    SEARCH: state => state.search,
    STORES: state => state.stores,
    COUNTER: state => state.counter,
    KEYTYPE: state => state.keyType,
    URL: state => `/api2/${state.name}`,
    ITEMS: state => state.items,
    HEADERS: state => state.headers,
    QUANTITY: state => state.quantity,
    FILTRED_ITEMS: state => payload => {
        let ret = [];
        for (let i = 0; i < state.items.length; i++) {
            const price = state.items[i];
            if (
                !(payload.more_or_equal && price.quantity < state.quantity) &&
                (price.quantity <= price.max) &&
                (price.ballance > 0) &&
                ((payload.name && price.name.indexOf(payload.name) >= 0) || !payload.name) &&
                (
                    (!_.isEmpty(payload.producers) && payload.producers.indexOf(price.producer_id) >=0)
                    || _.isEmpty(payload.producers)
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
    APPEND_ITEMS(state, items) {
        items.forEach((item) => {
            if (item.id === 0) {
                item.id = state.counter--;
                state.items.push(item);
            } else {
                const index = _.findIndex(state.items, { id: item.id });
                if (index >= 0) state.items.splice(index, 1, item);
                else state.items.push(item);
            }
        });
    },
    SET_SEARCH(state, name) {
        state.search = name;
    },
    SET_STORES(state, stores) {
        state.stores = stores;
    },
    SET_COUNTER(state, counter) {
        state.counter = counter;
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
    SORT(state) {
        state.items.sort((a,b) => {
            if (parseFloat(a.sum) > parseFloat(b.sum)) return 1;
            if (parseFloat(a.sum) < parseFloat(b.sum)) return -1;
            return 0
        })

    },
};

const append = function (payload, store, commit, rootGetters) {
   const params = _.cloneDeep(payload);
    params.filters = _.omit(params.filters, 'from_store_ids');
    params.filters.from_store = store;
    return axios.get(getters.URL(state), {params})
        .then((response) => {
            commit('APPEND_ITEMS', response.data);
            commit('SET_SUM', rootGetters['CURRENCY-RATE/ITEMS']);
            commit('SORT');
        })
        .catch((error) => {
            commit(
                'SNACKBAR/SET',
                {text: error.response.data, color: 'error', snackbar: 'true'},
                {root: true}
            );
        })
};

const actions = {
    GET_ITEMS({ getters, commit, rootGetters }, payload) {
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line no-debugger
            //debugger;
            if (payload.filters.name.length < 4) {
                resolve(getters.ITEMS);
            } else {
                let fromStore = null;
                if (payload.filters.name === getters.SEARCH) {
                    fromStore = _.difference(payload.filters.from_store_ids, getters.STORES);
                }
                commit('SET_STORES', payload.filters.from_store_ids);
                if (fromStore) {
                    if (fromStore.length > 0)
                        append(payload, _.first(fromStore), commit, rootGetters)
                            .then(() => resolve())
                            .catch(() => reject());
                    else resolve();
                } else {
                    const params = _.cloneDeep(payload);
                    if (payload.filters.from_store_ids.length === 0) params.filters.from_store_ids = null;
                    axios
                        .get(getters.URL, { params })
                        .then((response) => {
                            // eslint-disable-next-line no-debugger
                            // debugger;
                            commit('SET_SEARCH', payload.filters.name);
                            commit('SET_COUNTER', 0);
                            commit('SET_ITEMS', response.data);
                            commit('SET_SUM', rootGetters['CURRENCY-RATE/ITEMS']);
                            commit('SORT');
                            resolve({data: {rows: getters.ITEMS, count: getters.ITEMS.length}});
                        })
                        .catch((error) => {
                            commit(
                                'SNACKBAR/SET',
                                {text: error.response.data, color: 'error', snackbar: 'true'},
                                {root: true}
                            );
                            reject(error);
                        })
                        .then(() => {
                            payload.filters.from_store_ids.forEach((store) => {
                                append(payload, store, commit, rootGetters)
                            })
                        })
                }
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