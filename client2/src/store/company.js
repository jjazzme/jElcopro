import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.name = 'company';

state.breadcrumb = {
    text: 'КОМПАНИИ',
    to: { name: 'companies' },
    disabled: true,
};

/*state.headers = [
    {
        text: 'Наименование',
        value: 'name',
    },
    {
        text: 'Сайт',
        value: 'site'
    },
    {
        text: 'Правильный',
        value: 'rightProducer.name'
    }
];*/

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}