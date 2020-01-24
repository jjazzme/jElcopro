import document from './document'
import _ from 'lodash'
import model from '@/store/model';

let state = _.cloneDeep(document.state);
state.name = 'order';

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}