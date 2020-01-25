import document from './document'
import _ from 'lodash'
import model from '@/store/model';

let state = _.cloneDeep(document.state);
state.name = 'invoice';
state.breadcrumb = {
    text: 'СЧЕТА',
    to: { name: 'documents', params: { type: 'invoice' } },
    link: true,
    disabled: true,
};

export default {
    namespaced: true,
    state,
    getters: model.getters,
    mutations: model.mutations,
    actions: model.actions,
}