import _ from 'lodash';
import CompanyService from './CompanyService';
import Cache from './Cache';

export default class ExternalPriceService {
    constructor(service, company) {
        this._service = service;
        this._company = company;
    }

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
     * @param {Company|number}company
     * @returns {Promise<null|ExternalPriceService>}
     */
    static async forCompany(company) {
        const companies = _.filter(global.gConfig.companies, { stores: { main: { online: true } } });
        const companyInstance = await (new CompanyService()).getCompany(company);
        if (companyInstance) {
            const configCompany = _.find(companies, { inn: companyInstance.party.inn });
            if (configCompany) {
                companyInstance.days = configCompany.stores.main.days;
                companyInstance.cache_time = configCompany.cache_time;
                // eslint-disable-next-line new-cap
                const service = new (await import(`./${configCompany.service}`)).default(this._company);
                return new this(service, companyInstance);
            }
        }
        return null;
    }

    /**
     * Search by name
     * @param {string} name
     * @param {boolean} [withCache = true]
     * @returns {Promise<Object|undefined>}
     */
    async searchByName(name, withCache = true) {
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
     * @param {string} id (code)
     * @param {boolean} [withCache = true]
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
