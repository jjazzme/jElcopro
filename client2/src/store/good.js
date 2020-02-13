import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.headers = [
    { text: 'Код', value: 'code' },
    { text: 'Компания', value: 'store.company.alias' },
    { text: 'Склад', value: 'store.name' },
    { text: 'Остаток', value: 'ballance' },
    { text: 'Упаковка', value: 'pack' },
    { text: 'Кратность', value: 'multiply' },
    // { text: 'Активен', value: 'is_active' },
    { text: 'Обновлен', value: 'updatedAt' }
];

state.name = 'good';

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}