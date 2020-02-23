import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.headers = [
    { text: '', value: 'actions', width: 10, sortable: false },
    { text: 'Название', value: 'good.product.name' },
    { text: 'Из', value: 'parent.quantity' },
    { text: 'Резерв', value: 'reserve' },
    { text: 'В УПД', value: 'inTransfers' },
    { text: 'Количество', value: 'quantity' },
    { text: 'НДС', value: 'vat' },
    { text: 'Без НДС', value: 'price_without_vat' },
    { text: 'Сумма без', value: 'amount_without_vat' }
];

state.name = 'document-line';

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}