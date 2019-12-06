export default class ExternalPriceService {
    constructor(company, logger, cache) {
        this.cache = cache;
        this.logger = logger;
        this.company = company;
    }

    /**
     * Search by name
     * @param {string} name
     * @param {boolean} [withCache = true]
     * @returns {Promise<Object|undefined>}
     */
    async searchByName(name, withCache = true) {
        try {
            const func = async () => {
                const result = await this.apiSearchByName(name);
                // eslint-disable-next-line no-return-await
                return await this.parseApiAnswer(result, this.company.stores.main.days);
            };
            if (withCache) {
                const key = `${this.company.inn}_search_name_${name}`;
                return await this.cache.remember(key, this.company.cache_time, func);
            }
            return await func();
        } catch (e) {
            this.logger.error(e, 'ExternalPriceService.searchByName');
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
        try {
            const func = async () => {
                const result = await this.apiSearchById(id);
                // eslint-disable-next-line no-return-await
                return await this.parseApiAnswer(result, this.company.stores.main.days);
            };
            if (withCache) {
                const key = `${this.company.inn}_search_id_${id}`;
                return await this.cache.remember(key, this.company.cache_time, func);
            }
            return await func();
        } catch (e) {
            this.logger.error(e, 'ExternalPriceService.searchById');
            throw e;
        }
    }
}
