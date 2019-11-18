import axios from 'axios';
import Cache from './Cache';

export default class Dadata {
    /**
     * Query DaData and get Object with suggestions array
     * @param {string} type
     * @param {string} query
     * @returns {Promise<Object>}
     */
    static async query(type, query) {
        const key = `${type}_${query}`;
        try {
            if (await Cache.hasKey(key)) return await Cache.valueByKey(key);
            const response = await axios.get(global.gConfig.dadata.url + type, {
                headers: { Authorization: `Token ${global.gConfig.dadata.token}` },
                params: { query, count: 5 },
            });
            return await Cache.remember(key, response.data, 900);
        } catch (e) {
            console.warn(`Some problems with ${key}`);
            throw e;
        }
    }
}
