import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.name = 'store';

state.breadcrumb = {
    text: 'Склады',
    to: { name: 'stores' },
    disabled: true,
};

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}