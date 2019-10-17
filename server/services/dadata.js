const axios = require('axios').default;
const Cache = require('./Cache').default;

export default {
    /**
     * Query DaData and get Object with suggestions array
     * @param type
     * @param query
     * @returns {Promise<Object>}
     */
    query(type, query) {
        return new Promise((resolve, reject) => {
            Cache.remember(
                type + '_' + query,
                axios.get(global.gConfig.dadata.url + type, {
                    headers: {Authorization: 'Token ' + global.gConfig.dadata.token},
                    params: {query: query, count: 5}
                })
            )
                .then(res => resolve(res.data))
                .catch(err => reject(err))
        })
    }
}