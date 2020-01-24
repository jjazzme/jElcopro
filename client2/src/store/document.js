import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.headers = [
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
        text: 'Валюта',
        value: 'currency.char_code'
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