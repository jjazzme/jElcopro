'use strict';

import CompanyService from "./CompanyService";
import _ from "lodash";
import Cache from "./Cache";

export default class ExternalPriceService {

    /**
     * Company info
     */
    _company;

    /**
     * Api service for Company
     */
    _service;

    /**
     * Create instance this class with needing Company
     * @param company
     * @returns {Promise<null|ExternalPriceService>}
     */
    static async forCompany(company) {

        /**
         * INN for online stores - need make from config!TODO
         * @type {*[]}
         * @private
         */
        const companies = _.filter(global.gConfig.companies, { stores: { main: { online: true } } });
        this._company = await (new CompanyService()).getCompany( company );
        if (this._company) {
            const config_company = _.find(companies, { inn: this._company.party.inn })
            if (config_company) {
                this._company.days = config_company.stores.main.days;
                this._company.cache_time = config_company.cache_time;
                this._service = new (await import('./' + config_company.service)).default(this._company);
                return this;
            }
        }
        return null;
    }

    /**
     * Search by name
     * @param name
     * @param withCache
     * @returns {Promise<Object|undefined>}
     */
    static async searchByName(name, withCache = true) {
        const key = this._company.party.inn + '_search_name_' + name;
        if (withCache && (await Cache.hasKey(key))) {
            return (await Cache.valueByKey(key))
        }
        const result = await this._service.apiSearchByName(name);
        const ret = await this._service.parseApiAnswer(result, this._company.days);
        return (await Cache.remember(key, ret, this._company.cache_time))
    }

    /**
     * Search by id  (code)
     * @param id
     * @param withCache
     * @param days
     * @returns {Promise<Object|undefined>}
     */
    static async searchById(id, withCache = true) {
        const key = this._company.party.inn +'_search_id_' + id;
        if (withCache && (await Cache.hasKey(key))) {
            return (await Cache.valueByKey(key))
        }
        const result = await this._service.apiSearchById(id);
        const ret = await this._service.parseApiAnswer(result, this._company.days);
        return (await Cache.remember(key, ret, this._company.cache_time));
    }
}
