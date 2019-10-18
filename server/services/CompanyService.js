'use strict';

const Company = require('../models').Company;
const Party = require('../models').Party;
const Store = require('../models').Store;

const _ = require('lodash')
const dadata = require('./dadata').default;

const PartyService = require('../services/PartyService').default;
const AddressService = require('../services/AddressService').default;

export default {

    /**
     *
     * @param party_id
     * @param fact_address_id
     * @param own
     * @returns {Promise<Object>}
     */
    async updateOrCreate(party_id, fact_address_id, own = false) {
        let item = await Company.findOne({
            include: [{
                model: Store,
                required: true
            }],
            where: { party_id: party_id }
        });
        if (!item) {
            item = await Company.create({ party_id: party_id, fact_address_id: fact_address_id, own: own })
        } else if (!_.isEqual(item.fact_address_id, fact_address_id) || item.own !== own) {
            await item.update({fact_address_id: fact_address_id, own: own});
        }
        return item
    },

    /**
     *
     * @param inn
     * @param ogrn
     * @param storeName
     * @param own
     * @param online
     * @param is_main
     * @returns {Promise<Object>}
     */
    async makeCompanyWithStore(inn, ogrn, storeName, own = false, online = false, is_main = false) {
        let company = await Company.findOne({
            include: [{
                model: Party,
                required: true,
                where: { inn: inn, ogrn: ogrn }
            },{
                model: Store,
            }]
        })
        if (!company) {
            let newParty = (await dadata.query('party', inn)).suggestions[0];
            const party = await PartyService.updateOrCreate(inn, ogrn, newParty.value, newParty);
            const address = await AddressService.updateOrCreate(newParty.data.address.value, newParty.data.address);
            company = await this.updateOrCreate(party.id, address.id, own);
        }
        console.dir(company.stores, company.Store, company.Stores)
        return company
    }
}