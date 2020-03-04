import model from './model'
import _ from 'lodash'

let state = _.cloneDeep(model.state);

state.cache.push({
    id: 0,
    party_id: null,
    own: false,
    with_vat: true
});

state.name = 'company';

state.breadcrumb = {
    text: 'КОМПАНИИ',
    to: { name: 'companies' },
    disabled: true,
};

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}