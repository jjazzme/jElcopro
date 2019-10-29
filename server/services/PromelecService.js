'use strict';

import crypto from 'crypto';
import axios from 'axios';

export default class PromelecService  {

    constructor(company) {
        this._company = company;
    }

    /**
     * Comapny alias
     * @type {string}
     * @private
     */
    _company;

    /**
     * Promelec Api Methodå
     * @param method
     * @param params
     * @returns {Promise<*>}
     */
    async method(method, params) {
        Object.assign(params, {
            login: global.gConfig.companies.promelec.api_login,
            password: crypto.createHash('md5').update(global.gConfig.companies.promelec.api_pass).digest('hex'),
            customer_id: global.gConfig.companies.promelec.api_client_id,
            method: method,
        });
        const response = await axios.post(global.gConfig.companies.promelec.api_url, params);
        return response.data;
    }

    /**
     * Use Api Method items_data_find with name
     * @param name
     * @returns {Promise<*>}
     */
    async apiSearchByName(name) {
        return (await this.method('items_data_find', { name: name, extended: 1 }));
    }

    /**
     * Use Api Method item_data_get with id ( promelec code )
     * @param id
     * @returns {Promise<*>}
     */
    async apiSerchById(id) {
        return (await this.method('item_data_get', { item_id: id }));
    }
}
