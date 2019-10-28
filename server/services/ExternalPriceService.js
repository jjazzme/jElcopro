'use strict';

import CompanyService from "./CompanyService";
import _ from "lodash";
import Cache from "./Cache";

export default class ExternalPriceService {

    /**
     * Company info
     */
    static _company;

    /**
     * Get company
     * @returns {Promise<Object>}
     */
    static async getCompany() {
        if (! this._company) {
            this._company = await (new CompanyService()).getByAlias(this._alias);
        }
        return this._company;
    }

    /**
     * Get Main Company store
     * @returns {Promise<Object>}
     */
    static async getStore() {
        const company = await this.getCompany();
        return _.find(company.stores, { is_main: true });
    }

    /**
     * Search by name
     * @param name
     * @param withCache
     * @param days
     * @returns {Promise<Object|undefined>}
     */
    static async searchByName(name, withCache = true, days = 6) {
        const key = this._alias + '_search_name_' + name;
        if (withCache && (await Cache.hasKey(key))) {
            return (await Cache.valueByKey(key))
        }
        const result = await this.apiSearchByName(name);
        const ret = await this.parseApiAnswer(result, days);
        return (await Cache.remember(key, ret, global.gConfig.companies[this._alias].cache_time))
    }

    /**
     * Search by id  code)
     * @param id
     * @param withCache
     * @param days
     * @returns {Promise<Object|undefined>}
     */
    static async searchById(id, withCache = true, days = 6) {
        const key = 'compel_search_id_' + id;
        if (withCache && (await Cache.hasKey(key))) {
            return (await Cache.valueByKey(key))
        }
        const result = await this.apiSearchById(id);
        const ret = await this.parseApiAnswer(result, days);
        return (await Cache.remember(key, ret, global.gConfig.companies[this._alias].cache_time));
    }

}