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
        return (await Cache.remember(`cuurency${alias}`, this.find({ char_code: alias }), 900));
    }
}
