import _ from 'lodash';
import Sequelize from 'sequelize';
// import { cacheable } from './utils';

export default class PriceService {
    constructor(db, cache) {
        this.db = db;
        this.cache = cache;
    }

    _productPrototype() {
        const {
            Product, Producer, Parameter, ParameterValue,
        } = this.db.models;
        return {
            model: Product,
            as: 'product',
            required: true,
            include: [
                { model: Producer, as: 'producer', required: true },
                {
                    model: Parameter,
                    as: 'parameters',
                    required: false,
                    include: [
                        { model: ParameterValue, as: 'parameterValue' },
                    ],
                },
            ],
        };
    }

    _storePrototype() {
        const {
            Store, Company, InterStoreRoute, Party,
        } = this.db.models;
        return {
            model: Store,
            as: 'store',
            where: {},
            include: [
                {
                    model: Company,
                    as: 'company',
                    required: true,
                    include: [
                        { model: Party, as: 'party', required: true },
                    ],
                },
                {
                    model: InterStoreRoute,
                    as: 'fromRoutes',
                },
            ],
        };
    }

    /**
     * Search Prices By name with parameters as stores
     * @param {Object} optics
     * @param {string} optics.name - searching name
     * @param {Store|number|null} [optics.store = ElcoPro Main Store]  - our store for calculate delivery times
     * @param {Boolean=} optics.online - Use this for store type (oline, offline, if missing - all)
     * @param {number[]=} optics.from_store_ids - Search product only this stores or all if missing
     * @returns {Promise<Array|*>}
     */
    async searchByName(optics) {
        if (!optics || !optics.name || optics.name.length < 3) return [];
        const {
            Company, Currency, Good, Price, Product, ParameterName, Store,
        } = this.db.models;
        const { Op } = Sequelize;
        const searchName = Product.makeSearchName(optics.name);
        const product = this._productPrototype();
        product.where = { search_name: { [Op.substring]: searchName } };
        // eslint-disable-next-line no-underscore-dangle
        const case_ = await ParameterName.getInstance({ alias: 'case' });
        _.find(product.include, { as: 'parameters' }).where = { parameter_name_id: case_.id };
        //
        let { store } = optics;
        if (!store) {
            const company = await Company.getByAlias('elcopro');
            store = _.find(company.stores, { is_main: true });
        } else {
            store = await Store.getInstance(store);
        }
        const fromStore = this._storePrototype();
        _.find(fromStore.include, { as: 'fromRoutes' }).where = { to_store_id: store.id, is_active: true };
        if (optics.online !== null && optics.online !== undefined) {
            fromStore.where.online = optics.online;
        }
        if (optics.from_store_ids) {
            fromStore.where.id = { [Op.in]: optics.from_store_ids };
        }
        //
        const prices = await Price.findAll({
            include: [
                { model: Currency, as: 'currency' },
                {
                    model: Good,
                    as: 'good',
                    where: { is_active: true },
                    required: true,
                    include: [fromStore, product],
                },
            ],
        });
        return prices.map((price) => ({
            code: price.good.code,
            product_id: price.good.product_id,
            picture: price.good.product.picture,
            name: price.good.product.name,
            parameter_id: price.good.product.parameters.length > 0 ? price.good.product.parameters[0].id : null,
            case: price.good.product.parameters.length > 0
                ? price.good.product.parameters[0].parameterValue.name
                : null,
            vat: price.good.product.vat,
            with_vat: price.good.store.company.with_vat,
            remark: price.good.product.remark,
            producer_id: price.good.product.producer_id,
            producer_name: price.good.product.producer.name,
            store_id: price.good.store_id,
            store_name: price.good.store.name,
            company_id: price.good.store.company_id,
            party_name: price.good.store.company.party.name,
            average_days: price.good.store.fromRoutes[0].average_days,
            pack: price.good.pack,
            multiply: price.good.multiply,
            ballance: price.good.ballance,
            actual: price.good.updatedAt,
            online: 0,
            ..._.omit(price.dataValues, ['good', 'currency']),
        }));
    }

    /**
     * Search with Company Store Api or in Database
     * @param {Object} optics
     * @param {string} optics.name
     * @param {Store|number|null} [optics.store = ElcoPro Main Store]  - our store for calculate delivery times
     * @param {Store|number} optics.from_store - Instance or Id store for searching in
     * @returns {Promise<Array|*>}
     */
    // @cacheable
    async searchByNameOnStore(optics) {
        const { Store } = this.db.models;
        const { services } = Store;
        const storeInstance = await Store.getInstance(optics.from_store, 'withCompany');
        const configCompany = _.find(services.config.companies, { inn: storeInstance.company.party.inn });
        if (configCompany) {
            const serviceName = Object
                .keys(services.config.companies)
                .find((key) => services.config.companies[key] === configCompany);
            const service = services[serviceName];// get(serviceName);
            if (service) {
                return service.searchByName(optics.name);
            }
        }
        return this.searchByName(
            { name: optics.name, from_store_ids: [storeInstance.id], store: optics.store },
        );
    }
}
