//import Vue from 'vue';
import store from '../store/_index'

export default function env({ next, }) {
    // from, to, router
    store.commit('User/setLastUserActivity');
    return next();
}