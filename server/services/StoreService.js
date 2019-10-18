'use strict';

const Store = require('../models').Store;
const Company = require('../models').Company;

export default {

    /**
     *
     * @param company_id
     * @param address_id
     * @param name
     * @param phone
     * @param online
     * @param is_main
     * @returns {Promise<Object>}
     */
    async updateOrCreate(company_id, address_id, name, phone = null, online = false, is_main = true) {
        let store = await Store.findOne({
            include:[{
                model: Company,
                required: true,
            }],
            where: {company_id: company_id, name: name}
        });
        if (!store) {
            store = await Store.create({
                company_id: company_id,
                address_id: address_id,
                name: name,
                phone: phone,
                online: online,
                is_main: is_main
            });
        } else if (
            store.phone !== phone ||
            store.address_id !== address_id ||
            store.online !== online ||
            store.is_main !== is_main
        ) {
            await store.update({phone: phone, address_id: address_id, online: online, is_main: is_main});
        }
        return store;
    }
}
