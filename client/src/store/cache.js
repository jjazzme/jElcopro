'use strict'

let state = {
    class: {unit: 0, set: 100},
    ttl: {short: 60e3, regular: 60*10e3, long: 60*60e3, extra: 24*60*60e3},
    world:{}
};

let getters = {

};

let mutations = {

};

let actions = {

};


export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}

class CacheItem {
    constructor({type, ttl}){
        this.type = type;
        this.ttl = ttl
    }
}
