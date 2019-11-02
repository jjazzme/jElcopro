import Entity from "./Entity";
import { Currency } from '../models';
import Cache from "./Cache";

export default class CurrencyService extends Entity {

    constructor() {
        super(Currency);
    }

    /**
     * Get currency by Alias
     * @param alias
     * @returns {Promise<Object>}
     */
    async getByAlias(alias){
        return (await Cache.remember('cuurency' + alias, this.find({ char_code: alias }), 900));
    }
}