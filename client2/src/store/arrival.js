import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.headers = [
    { text: 'Дата', value: 'documentLine.document.date' },
    { text: 'Номер', value: 'documentLine.document.number' },
    { text: 'Остаток', value: 'ballance' },
    { text: 'Из', value: 'documentLine.quantity' },
    { text: 'Цена c НДС', value: 'documentLine.price_with_vat' },
    { text: 'Валюта', value: 'documentLine.document.currency_id' },
];

state.name = 'arrival';

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}