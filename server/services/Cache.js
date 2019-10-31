export default class Cache{

    /**
     * Remember Value by Key
     * @param key
     * @param value
     * @param minutes
     * @returns {Promise<Object>}
     */
     static async remember(key, value, minutes = 1) {
        return value
     }

    /**
     * See has Key or Not
     * @param key
     * @returns {Promise<boolean>}
     */
     static async hasKey(key) {
         return false;
     }

    /**
     * Get Value by Key
     * @param key
     * @returns {Promise<undefined>}
     */
     static async valueByKey(key) {
         return undefined;
     }
}