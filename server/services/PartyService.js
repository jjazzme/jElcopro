'use strict';

const Party = require('../models').Party;
const Dadata = require('./Dadata').default;
import Entity from "./Entity";

export default class PartyService extends Entity {

    constructor() {
        super(Party)
    }

    /**
     * Update Or Create from Dadata service by INN
     * @param inn
     * @returns {Promise<Object>}
     */
    async fromDadata(inn) {
        const res = await Dadata.query('party', inn);

        if (res.suggestions.length > 0) {
            return (
                await this.updateOrCreate(
                    {
                        inn: inn,
                        ogrn: res.suggestions[0].data.ogrn
                    },
                    {
                        name: res.suggestions[0].value,
                        json: res.suggestions[0]
                    }
                )
            );
        }
    }
}