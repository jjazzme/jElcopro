import _ from 'lodash';
import BaseModel from './BaseModel';

export default class Producer extends BaseModel {
    /**
     * Name is alias
     * @param alias
     * @param args
     * @returns {Promise<*>}
     */
    static async getByAlias(alias, ...args) {
        const scopes = _.flattenDeep(args);
        return this.scope(scopes).findOne({ where: { name: alias } });
    }
}
