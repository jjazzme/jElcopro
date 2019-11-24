import crypto from 'crypto';
import axios from 'axios';
import _ from 'lodash';
import ExternalPriceService from './ExternalPriceService';

export default class PromelecService extends ExternalPriceService {
    constructor(config, db, logger, cache) {
        super(config.companies.promelec, logger, cache)
        this.db = db;
    }

    /**
     * Parse Promelec Api Item
     * @param item
     * @param case_
     * @param store
     * @returns {Promise<{product: *, parameter: *, package_: *, producer: *, good: *}>}
     */
    async _parseApiItem(item, case_, store) {
        const {
            Producer, Product, ParameterValue, Parameter, Good,
        } = this.db.models;
        const producer = await Producer.getRightInstanceOrCreate({ name: item.producer_name });
        const product = await Product.getRightInstanceOrCreate({ name: item.name, producer_id: producer.id });
        // eslint-disable-next-line no-underscore-dangle
        const package_ = await ParameterValue.getRightInstanceOrCreate(
            { name: item.package ? item.package : '', parameter_name_id: case_.id },
        );
        const parameter = await Parameter.updateInstanceOrCreate(
            { parameter_name_id: case_.id, product_id: product.id },
            { parameter_value_id: package_.id },
        );
        const newItem = {
            ballance: item.quant,
            pack: item.pack_quant ? item.pack_quant : 1,
            multiply: item.price_unit,
        };
        const good = await Good.updateInstanceOrCreate(
            { store_id: store.id, code: item.item_id, product_id: product.id }, newItem, 'withProduct',
        );
        return {
            producer, product, package_, parameter, good,
        };
    }

    /**
     * Promelec Api Method
     * @param method
     * @param params
     * @returns {Promise<*>}
     */
    async method(method, params) {
        Object.assign(params, {
            login: this.company.api_login,
            password: crypto.createHash('md5').update(this.company.api_pass).digest('hex'),
            customer_id: this.company.api_client_id,
            method,
        });
        const response = await axios.post(this.company.api_url, params);
        return response.data;
    }

    /**
     * Use Api Method items_data_find with name
     * @param name
     * @returns {Promise<*>}
     */
    async apiSearchByName(name) {
        try {
            return await this.method('items_data_find', { name, extended: 1 });
        } catch (e) {
            this.logger.error(e, 'Error in PromelecService.apiSearchByName');
            throw e;
        }
    }

    /**
     * Use Api Method item_data_get with id ( promelec code )
     * @param id
     * @returns {Promise<*>}
     */
    async apiSearchById(id) {
        return [(await this.method('item_data_get', { item_id: id }))];
    }

    /**
     * Parse Promelec Api answer to price objects
     * @param result
     * @param days
     * @returns {Promise<Array>}
     */
    async parseApiAnswer(result, days = 8) {
        const {
            Currency, ParameterName, Price, Company,
        } = this.db.models;
        const currency = await Currency.getInstance({ char_code: 'RUB' });
        // eslint-disable-next-line no-underscore-dangle
        const case_ = await ParameterName.getInstance({ alias: 'case' });
        // eslint-disable-next-line camelcase
        const { min_sum } = this.company;
        const company = await Company.getByAlias('promelec');
        const store = _.find(company.stores, { is_main: true });
        const ret = await Promise.all(
            // eslint-disable-next-line no-async-promise-executor,no-unused-vars
            result.map((item) => new Promise(async (resolve, reject) => {
                const { good, package_, parameter, producer } = await this._parseApiItem(item, case_, store);
                const prices = [];
                // eslint-disable-next-line camelcase
                const base_price = {
                    code: item.item_id,
                    product_id: good.product.id,
                    picture: good.product.picture,
                    name: good.product.name,
                    parameter_id: parameter.id,
                    case: package_.name,
                    remark: good.product.remark,
                    producer_id: producer.id,
                    producer_name: producer.name,
                    store_id: store.id,
                    store_name: store.name,
                    company_id: company.id,
                    party_name: company.party.name,
                    pack: good.pack,
                    multiply: good.multiply,
                    good_id: good.id,
                    currency_id: currency.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                    actual: new Date(),
                    with_vat: 1,
                    vat: good.product.vat,
                };
                // eslint-disable-next-line camelcase
                const item_min = item.moq > item.quant ? item.quant : item.moq;
                if (item.quant > 0) {
                    // eslint-disable-next-line camelcase
                    const old_prices = await Price.findAll({ where: { good_id: good.id } });
                    // eslint-disable-next-line no-plusplus
                    for (let i = 0; i < 5; i++) {
                        // eslint-disable-next-line camelcase
                        let min = item_min < item.pricebreaks[i].quant ? item.pricebreaks[i].quant : item_min;
                        if (
                            // eslint-disable-next-line camelcase,no-mixed-operators
                            min * item.pricebreaks[i].price / item.price_unit < min_sum
                            // eslint-disable-next-line no-mixed-operators,camelcase
                            && item.pricebreaks[i].price / item.price_unit * item.quant > min_sum
                        ) {
                            // eslint-disable-next-line camelcase
                            min = Math.ceil(min_sum / (item.pricebreaks[i].price / item.price_unit));
                        }
                        const max = i === 4 ? item.quant : item.pricebreaks[i + 1].quant - 1;
                        // eslint-disable-next-line camelcase
                        const our_price = (item.pricebreaks[i].price) / (item.price_unit);
                        // eslint-disable-next-line camelcase
                        const for_all_price = (item.pricebreaks[i].pureprice) / (item.price_unit);
                        let id = 0;
                        if (old_prices.length > 0) {
                            await old_prices[i].update(
                                {
                                    min,
                                    max,
                                    our_price,
                                    for_all_price,
                                },
                            );
                            id = old_prices[i].id;
                        } else {
                            const newPrice = await Price.create({
                                currency_id: currency.id,
                                good_id: good.id,
                                min,
                                max,
                                our_price,
                                for_all_price,
                            });
                            id = newPrice.id;
                        }
                        prices.push({
                            id,
                            average_days: days,
                            ballance: item.quant,
                            min,
                            max,
                            our_price,
                            for_all_price,
                            online: 1,
                            // eslint-disable-next-line camelcase
                            ...base_price,
                        });
                    }
                }
                if (item.vendors) {
                    item.vendors.forEach((vendor) => {
                        if (vendor.pricebreaks) {
                            let max = vendor.quant;
                            vendor.pricebreaks.reverse().forEach((pricebreak) => {
                                prices.push({
                                    id: 0,
                                    average_days: days + vendor.delivery,
                                    ballance: vendor.quant,
                                    min: pricebreak.quant,
                                    max,
                                    our_price: pricebreak.price,
                                    for_all_price: 0,
                                    online: vendor.delivery,
                                    // eslint-disable-next-line camelcase
                                    ...base_price,
                                });
                                max = pricebreak.quant - 1;
                            });
                        }
                    });
                }
                resolve(prices);
            })),
        );
        return [].concat(...ret);
    }
}
