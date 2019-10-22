'use strict';

import Entity from "./Entity";
import { Address, Company, Party, Store } from "../models";
import dadata from './dadata';
import Cache from './Cache'
import PartyService from "./PartyService";
import AddressService from './AddressService';
import StoreService from "./StoreService";

export default class CompanyService extends Entity {

    _PartyService = new PartyService();
    _AddressService = new AddressService();
    static _StoreService = new StoreService();

    constructor(){
        super(Company);
        this._includes = [
            { model: Address, required: true, as: 'factAddress' },
            { model: Party, required: true, as: 'party' },
            { model: Store, as: 'stores' }
        ];
    }

    /**
     * Update Or Create By INN & OGRN
     * @param inn
     * @param ogrn
     * @param own
     * @returns {Promise<Object>}
     */
    async updateOrCreateByInnOgrn(inn, ogrn, own = false) {
        let company = await Company.findOne({
            include: [
                { model: Party, required: true,  where: { inn: inn, ogrn: ogrn }, as: 'party' },
                { model: Address, required: true, as: 'factAddress' },
                { model: Store, as: 'stores' }
             ]
        });
        if (!company) {
            let newParty = (await dadata.query('party', inn)).suggestions[0];
            const party = await this._PartyService.updateOrCreate(
                { inn: inn }, { ogrn: ogrn, name: newParty.value, json: newParty }
            );
            const address = await this._AddressService.updateOrCreate(
                { address: newParty.data.address.value}, { json: newParty.data.address }
            );
            company = await this.create({ party_id: party.id, fact_address_id: address.id, own: own });
        }
        return company;
    }

    /**
     * Update Or Create with Main(Default) Store
     * @param inn
     * @param ogrn
     * @param storeName
     * @param own
     * @param online
     * @param is_main
     * @returns {Promise<Object>}
     */
    async updateOrCreateWithStore(inn, ogrn, storeName, own = false, online = false, is_main = true) {
        const company = await this.updateOrCreateByInnOgrn(inn, ogrn, own);
        if (company.stores.length === 0) {
            const store = await this._StoreService.updateOrCreate(
                { company_id: company.id, address_id: company.fact_address_id },
                { name: storeName, online: online, is_main: is_main }
            );
            company.stores.push(store)
        }
        return company
    }

    /**
     * Search by Alias from config
     * @param alias
     * @returns {Promise<Object|undefined>}
     */
    async getByAlias(alias) {
        let company = require('../config/companies').default[alias];
        if (!company) {
            return undefined;
        }
        return (await Cache.remember('company_' + alias, this.updateOrCreateWithStore(
            company.inn, company.ogrn, company.stores.main.name, company.own, company.stores.main.online
        )));
    }
}