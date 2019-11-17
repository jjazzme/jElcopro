import ModelService from './ModelService';
import { Currency } from '../models';
import Cache from './Cache';

export default class CurrencyService extends ModelService {
    constructor() {
        super(Currency);
    }

    /**
     * Get currency by Alias
     * @param alias
     * @returns {Promise<Object>}
     */
    async getByAlias(alias) {
        // eslint-disable-next-line no-return-await
        const key = `curency${alias}`;
        try {
            if (await Cache.hasKey(key)) return await Cache.valueByKey(key);
            return await Cache.remember(key, await this.find({ char_code: alias }), 900);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
