import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.headers = [
    { text: '', value: 'actions', width: 10, sortable: false },
    { text: 'Мин.', value: 'min' },
    { text: 'Макс.', value: 'max' },
    { text: 'Покупаем', value: 'our_price' },
    { text: 'Продаем', value: 'for_all_price' },
    { text: 'Валюта', value: 'currency.char_code' },
    { text: 'Обновлена', value: 'updatedAt' }
];

state.name = 'price';

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}