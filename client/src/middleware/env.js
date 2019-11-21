//import Vue from 'vue';
import store from '../store/_index'

export default function env({ next, }) {
    // from, to, router
    store.commit('AUTH/SET_LAST_USER_ACTIVITY');
    return next();
}