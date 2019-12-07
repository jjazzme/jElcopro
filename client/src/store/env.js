'use strict'

let state = {
    title: {
        method: '',
        main: '',
        class: 'ELCOPRO',
        note: '',
        delimeter_one: ' | ',
        delimeter_two: ' : '

        // Продукты | Таблицы | ELCOPRO : ddgs sdgsgdfdgdg sdgsdgsd
    },
    footer: {
        component: {name:'footerStandard', vmodel: null}
    },
    routes:{

    }
};

let getters = {
    GET_HEAD_TITLE: state => {
        let title = state.title.class;
        if (state.title.main) title = `${state.title.main.replace(/^[а-я a-z]/, c => c.toUpperCase())}${state.title.delimeter_one}${title}`;
        if (state.title.method) title = `${state.title.method.replace(/^[а-я a-z]/, c => c.toUpperCase())}${state.title.delimeter_one}${title}`;
        if (state.title.note) title = `${title}${state.title.delimeter_two}${state.title.note}`;
        return title;
    },
    GET_TITLE: state => state.title,
    GET_FOOTER_COMPONENT: state => {
        return state.footer.component
    },
    GET_ROUTE: state => name => state.routes[name],
};

let mutations = {
    SET_TITLE(state, {main,method,note}) {
        state.title.main = main;
        state.title.method = method;
        state.title.note = note;
    },
    SET_FOOTER_COMPONENT(state, value) { state.footer.component=value },
    SET_ROUTE(state, {name, params, query}){state.routes[name] = {params, query}}
};

let actions = {
    SET_ROUTE({commit}, {name, params, query}){
        commit('SET_ROUTE', {name, params, query})
        //TODO сохранение в базе
    }
};


export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
