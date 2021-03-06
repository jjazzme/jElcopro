import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);
state.cache.push({
    id: 0,
    date: new Date(),
    status_id: 'formed',
    currency_id: 'R01000',
});

state.headers = [
    { text: '', value: 'actions', width: 10, sortable: false },
    {
        text: 'Дата',
        value: 'date',
    },
    {
        text: 'Префикс',
        value: 'number_prefix'
    },
    {
        text: 'Номер',
        value: 'number'
    },
    {
        text: 'Продвец',
        value: 'sellerable.party.name'
    },
    {
        text: 'Покупатель',
        value: 'buyerable.party.name'
    },
    {
        text: 'Склад',
        value: 'store.name'
    },
    {
        text: 'Строк',
        value: 'count_document_lines'
    },
    {
        text: 'Сумма с НДС',
        value: 'amount_with_vat'
    },
    {
        text: 'Валюта',
        value: 'currency.char_code'
    },
    {
        text: 'Статус',
        value: 'status_id'
    },
    {
        text: 'Закрыт',
        value: 'closed'
    },
];

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}