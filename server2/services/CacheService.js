import _ from 'lodash';
import redis from 'redis';
import bluebird from 'bluebird';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export default class Cache {
    constructor(logger) {
        this.client = redis.createClient(6379);
        this.logger = logger;
    }

    /**
     * Remember Value by Key
     * @param {string} key
     * @param {*} value
     * @param {number} minutes
     * @returns {Promise<Object>}
     */
    async put(key, value, minutes = 1) {
        try {
            let data;
            if (_.isObject(value)) {
                data = JSON.stringify(value);
            } else {
                data = value;
            }
            await this.client.setAsync(key, data, 'EX', minutes * 60);
            this.logger.debug({ key }, 'CACHE PUT');
            return value;
        } catch (e) {
            this.logger.error(e, 'Error in Cache put');
            throw e;
        }
    }

    /**
     * See has Key or Not
     * @param {String} key
     * @returns {Promise<boolean>}
     */
    async has(key) {
        try {
            const ret = await this.client.existsAsync(key);
            return !!ret;
        } catch (e) {
            this.logger.error(e, 'Error in Cache has');
            throw e;
        }
    }

    /**
     * Get Value by Key
     * @param {string} key
     * @returns {Promise<*>}
     */
    async get(key) {
        const data = await this.client.getAsync(key);
        let ret;
        try {
            ret = JSON.parse(data);
        } catch (e) {
            ret = data;
        }
        this.logger.debug({ key }, 'CACHE GET');
        return ret;
    }

    /**
     *  Forget value by key
     * @param key
     * @returns {Promise<boolean>}
     */
    async forget(key) {
        try {
            const ret = await this.client.delAsync(key);
            this.logger.debug({ key }, 'CACHE DEL');
            return !!ret;
        } catch (e) {
            this.logger.error(e, 'Error in Cache forget');
            throw e;
        }
    }

    /**
     * Get by key or remember function result
     * @param {string} key
     * @param {number} minutes
     * @param {function} callback
     * @returns {Promise<Object|*>}
     */
    async remember(key, minutes, callback) {
        try {
            if (await this.has(key)) return await this.get(key);
            const value = await callback();
            return await this.put(key, value, minutes);
        } catch (e) {
            this.logger.error(e, 'Errr in cache remember');
            throw e;
        }
    }
}
