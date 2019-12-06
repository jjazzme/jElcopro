import axios from 'axios';

export default class Dadata {
    constructor(config, cache, logger) {
        this.cache = cache;
        this.url = config.dadata.url;
        this.token = config.dadata.token;
        this.logger = logger;
    }

    /**
     * Query DaData and get Object with suggestions array
     * @param {string} type
     * @param {string} query
     * @returns {Promise<Object>}
     */
    async query(type, query) {
        const key = `${type}_${query}`;
        try {
            if (await this.cache.has(key)) {
                return await this.cache.get(key);
            }
            const response = await axios.get(this.url + type, {
                headers: { Authorization: `Token ${this.token}` },
                params: { query, count: 5 },
            });
            return await this.cache.put(key, response.data, 900);
        } catch (e) {
            this.logger.error(e, `Some problems with ${key}`);
            throw e;
        }
    }
}
