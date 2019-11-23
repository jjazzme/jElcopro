import _ from 'lodash';
import BaseModel from './BaseModel';

export default class Company extends BaseModel {
    /**
     * Get company by alias
     * @param {string} alias
     * @param args - scopes
     * @returns {Promise<null|Object|*>}
     */
    static async getByAlias(alias, ...args) {
        const scopes = _.union(_.flattenDeep(args), ['defaultScope', 'withStores']);
        const {
            config, cache, db, logger,
        } = this.services;
        const configCompany = config.companies[alias];
        if (configCompany) {
            const key = `company_${alias}_${_.join(scopes)}`;
            try {
                return await cache.remember(key, configCompany.cache_time || 900, async () => {
                    const {
                        // eslint-disable-next-line camelcase
                        inn, ogrn, own, with_vat,
                    } = configCompany;
                    const company = await this.getFromDadata(inn, ogrn, { own, with_vat }, scopes);
                    if (company.stores.length === 0) {
                        const { Store } = db.models;
                        const { online } = configCompany.stores.main;
                        const [store] = await Store.findOrCreate({
                            where: { company_id: company.id, address_id: company.fact_address_id },
                            defaults: { is_main: true, online },
                        });
                        company.stores.push(store);
                    }
                    return company;
                });
            } catch (e) {
                logger.error(e, 'Error in Company.getByAlias');
            }
        }
        return null;
    }

    /**
     * Get company from Dadata
     * @param {string|number} inn
     * @param {string|number} ogrn
     * @param args - scopes(string), defaults(Object)
     * @returns {Promise<*>}
     */
    static async getFromDadata(inn, ogrn, ...args) {
        const { db, dadata } = this.services;
        const { Address, Party } = db.models;
        const scopes = _.flattenDeep(args).filter((v) => _.isString(v));
        const additional = _.find(args, (o) => _.isPlainObject(o));
        let company = await this
            .scope(scopes)
            .findOne({ include: [{ model: Party, as: 'party', where: { inn, ogrn } }] });
        if (!company) {
            const dadataQuery = await dadata.query('party', inn.toString());
            if (dadataQuery.suggestions.length === 0) throw new Error(`Not found Party with inn ${inn}`);
            const dadataParty = dadataQuery.suggestions[0];
            const [party] = await Party.findOrCreate(
                { where: { inn, ogrn }, defaults: { name: dadataParty.value, json: dadataParty } },
            );
            const [address] = await Address.findOrCreate({
                where: { address: dadataParty.data.address.value }, defaults: { json: dadataParty.data.address },
            });
            company = await this.create({ party_id: party.id, fact_address_id: address.id, ...additional });
            if (scopes.length > 0) company = await this.scope(scopes).findByPk(company.id);
        }
        return company;
    }
}
