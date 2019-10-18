'use strict'

const Address = require('../models').Address;

const _ = require('lodash')

export default {

    /**
     *
     * @param address
     * @param json
     * @returns {Promise<Object>}
     */
    async updateOrCreate(address, json) {
        let item = await Address.findOne({ where: { address: address }});
        if (!item) {
            item = await Address.create({ address: address, json: json })
        } else if (!_.isEqual(item.json, json)) {
            await item.update({json: json});
        }
        return item
    },
}