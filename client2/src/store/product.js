import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.name = 'product';

state.breadcrumb = {
    text: 'ПРОДУКТЫ',
    to: { name: 'products' },
    disabled: true,
};

state.headers = [
    {
        text: 'Наименование',
        value: 'name',
    },
    {
        text: 'Производитель',
        value: 'producer.name'
    }
];

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}