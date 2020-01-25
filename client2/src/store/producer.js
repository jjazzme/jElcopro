import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.name = 'producer';
state.headers = [
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
];

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}