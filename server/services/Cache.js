import _ from 'lodash';
import redis from 'redis';
import bluebird from 'bluebird';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export default class Cache {
    static _client = redis.createClient(6379);

    /**
     * Remember Value by Key
     * @param {string} key
     * @param {*} value
     * @param {number} minutes
     * @returns {Promise<Object>}
     */
    static async remember(key, value, minutes = 1) {
        try {
            let data;
            if (_.isObject(value)) {
                data = JSON.stringify(value);
            } else {
                data = value;
            }
            await this._client.setAsync(key, data, 'EX', minutes * 60);
            return value;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    /**
     * See has Key or Not
     * @param {String} key
     * @returns {Promise<boolean>}
     */
    static async hasKey(key) {
        try {
            const ret = await this._client.existsAsync(key);
            return !!ret;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    /**
     * Get Value by Key
     * @param {string} key
     * @returns {Promise<*>}
     */
    static async valueByKey(key) {
        const data = await this._client.getAsync(key);
        let ret;
        try {
            ret = JSON.parse(data);
        } catch (e) {
            ret = data;
        }
        return ret;
    }
}
