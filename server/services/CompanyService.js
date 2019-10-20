'use strict';

import Entity from "./Entity";
import { Address } from "../models";

const Company = require('../models').Company;
const Party = require('../models').Party;
const Store = require('../models').Store;

const dadata = require('./dadata').default;
const Cache = require('./Cache').default;

const PartyService = require('../services/PartyService').default;
const AddressService = require('../services/AddressService').default;
const StoreService = require('../services/StoreService').default;

export default class CompanyService extends Entity {

    _PartyService = new PartyService();

    constructor(){
        super(Company);
        this._includes = [
            { model: Address, required: true },
            { model: Party, required: true },
            { model: Store }
        ];
    }

    /**
     *
     * @param inn
     * @param ogrn
     * @param own
     * @returns {Promise<Object>}
     */
    async updateOrCreateOnInnOgrn(inn, ogrn, own = false) {
        let company = await Company.findOne({
            include: [
                { model: Party, required: true,  where: { inn: inn, ogrn: ogrn } },
                { model: Address, required: true },
                { model: Store }
             ]
        });
        if (!company) {
            let newParty = (await dadata.query('party', inn)).suggestions[0];
            const party = await this._PartyService.updateOrCreate(
                { inn: inn }, { ogrn: ogrn, name: newParty.value, json: newParty }
            );
            const address = await AddressService.updateOrCreate(newParty.data.address.value, newParty.data.address);
            company = await this.create({ party_id: party.id, fact_address_id: address.id, own: own });
        }
        return company;
    }

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
    async updateOrCreateWithStore(inn, ogrn, storeName, own = false, online = false, is_main = true) {
        const company = await this.updateOrCreateOnInnOgrn(inn, ogrn, own);
        if (!company.Stores || company.Stores.length === 0) {
            const store = await StoreService.updateOrCreate(company.id, company.address_id, storeName, online, is_main);
            company.Stores.push(store)
        }
        return company
    }

    /**
     *
     * @param alias
     * @returns {Promise<Object|undefined>}
     */
    async getByAlias(alias) {
        let company = require('../config/companies').default[alias];
        console.dir(alias, company);
        if (!company) {
            return undefined;
        }
        return Cache.remember('company_' + alias, this.updateOrCreateWithStore(
            company.inn, company.ogrn, company.stores.main.name, company.own, company.stores.main.online
        ));
    }
}