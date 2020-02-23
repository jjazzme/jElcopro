import document from './document'
import _ from 'lodash'
import model from '@/store/model';

let state = _.cloneDeep(document.state);
state.name = 'transfer-out';
state.breadcrumb = {
    text: 'ИСХОДЯЩИЕ УПД',
    to: { name: 'documents', params: { type: 'transfer-out' } },
    link: true,
    disabled: false,
};

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}