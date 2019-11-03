
import _ from 'lodash';
import CompanyService from './CompanyService';
import Cache from './Cache';

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
        const companies = _.filter(global.gConfig.companies, { stores: { main: { online: true } } });
        this._company = await (new CompanyService()).getCompany(company);
        if (this._company) {
            const configCompany = _.find(companies, { inn: this._company.party.inn });
            if (configCompany) {
                this._company.days = configCompany.stores.main.days;
                this._company.cache_time = configCompany.cache_time;
                // eslint-disable-next-line new-cap
                this._service = new (await import(`./${configCompany.service}`)).default(this._company);
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
        const key = `${this._company.party.inn}_search_name_${name}`;
        if (withCache && (await Cache.hasKey(key))) {
            try {
                return await Cache.valueByKey(key);
            } catch (e) {
                console.error(e);
                throw e;
            }
        }
        const result = await this._service.apiSearchByName(name);
        const ret = await this._service.parseApiAnswer(result, this._company.days);
        try {
            return await Cache.remember(key, ret, this._company.cache_time);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    /**
     * Search by id  (code)
     * @param id
     * @param withCache
     * @returns {Promise<Object|undefined>}
     */
    static async searchById(id, withCache = true) {
        const key = `${this._company.party.inn}_search_id_${id}`;
        if (withCache && (await Cache.hasKey(key))) {
            try {
                return await Cache.valueByKey(key);
            } catch (e) {
                console.error(e);
                throw e;
            }
        }
        const result = await this._service.apiSearchById(id);
        const ret = await this._service.parseApiAnswer(result, this._company.days);
        try {
            return await Cache.remember(key, ret, this._company.cache_time);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
