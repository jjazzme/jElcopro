'use strict';

const Party = require('../models').Party;
const dadata = require('./dadata').default;
const _ = require('lodash')

export default {

    /**
     *
     * @param inn
     * @param ogrn
     * @param name
     * @param json
     * @returns {Promise<Object>}
     */
    async updateOrCreate(inn, ogrn, name, json) {
        let item = await Party.findOne({ where: { inn: inn, ogrn: ogrn }});
        if (!item) {
            item = await Party.create({ inn: inn, ogrn: ogrn, name: name, json: json })
        } else if (item.name != name || !_.isEqual(item.json, json)) {
            await item.update({name: name, json: json});
        }
        return item
    },

    /**
     *
     * @param inn
     * @returns {Promise<Object>}
     */
    async fromDadata(inn) {
        const res = await dadata.query('party', inn);

        if (res.suggestions.length > 0) {
            const ret =
                await this.updateOrCreate(inn, res.suggestions[0].data.ogrn, res.suggestions[0].value, res.suggestions[0]);
            return (ret);
        }
    }
}