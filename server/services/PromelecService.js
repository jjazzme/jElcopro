// import fs from 'fs';
import crypto from 'crypto';
import axios from 'axios';
import _ from 'lodash';
import CurrencyService from "./CurrencyService";
import ParameterNameService from "./ParameterNameService";
import ProducerService from "./ProducerService";
import ProductService from "./ProductService";
import ParameterValueService from "./ParameterValueService";
import ParameterService from "./ParameterService";
import GoodService from "./GoodService";
import CompanyService from "./CompanyService";
import PriceService from "./PriceService";
import { Price } from "../models";

export default class PromelecService  {

    constructor(company) {
        this._company = company;
    }

    /**
     * Comapny alias
     * @type {string}
     * @private
     */
    _company;

    /**
     * Parse Promelec Api Item
     * @param item
     * @param case_
     * @param store
     * @returns {Promise<{product: *, parameter: *, package_: *, producer: *, good: *}>}
     */
    async #parseApiItem(item, case_, store) {
        const producer = await (new ProducerService()).firstOrCreate({ name: item.producer_name });
        const product = await (new ProductService())
            .firstOrCreate({ name: item.name, producer_id: producer.id });
        const package_ = await (new ParameterValueService())
            .firstOrCreate({ name: item.package ? item.package : '', parameter_name_id: case_.id });
        const parameter = await (new ParameterService())
            .firstOrCreate(
                { parameter_name_id: case_.id, product_id: product.id },
                { parameter_value_id: package_.id }
            );
        const newItem = {
            ballance: item.quant,
            pack: item.pack_quant ? item.pack_quant : 1,
            multiply: item.price_unit
        };
        const good = await (new GoodService())
            .updateOrCreate({store_id: store.id, code: item.item_id, product_id: product.id}, newItem);

        return { producer: producer, product: product, package_: package_, parameter: parameter, good: good }
    }

    /**
     * Promelec Api Method
     * @param method
     * @param params
     * @returns {Promise<*>}
     */
    async method(method, params) {
        Object.assign(params, {
            login: global.gConfig.companies.promelec.api_login,
            password: crypto.createHash('md5').update(global.gConfig.companies.promelec.api_pass).digest('hex'),
            customer_id: global.gConfig.companies.promelec.api_client_id,
            method: method,
        });
        const response = await axios.post(global.gConfig.companies.promelec.api_url, params);
        // fs.writeFileSync("tda2003v.json", JSON.stringify(response.data));
        return response.data;
    }

    /**
     * Use Api Method items_data_find with name
     * @param name
     * @returns {Promise<*>}
     */
    async apiSearchByName(name) {
        return (await this.method('items_data_find', { name: name, extended: 1 }));
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
        const currency = await (new CurrencyService()).getByAlias('RUB');
        const case_ = await (new ParameterNameService()).getByAlias('case');
        const min_sum = global.gConfig.companies.promelec.min_sum;
        if (!this._company) {
            this._company = await (new CompanyService()).getByAlias('promelec');
        }
        const store = _.find(this._company.stores, { is_main: true });
        const price_service = new PriceService();
        const ret = await Promise.all(
            result.map(item => new Promise(async (resolve, reject) => {
                const { good, parameter, producer } = await this.#parseApiItem(item, case_, store);
                let prices = [];
                const base_price = {
                    code: item.item_id,
                    product_id: good.product.id,
                    picture: good.product.picture,
                    name: good.product.name,
                    parameter_id: parameter.id,
                    case: parameter.parameterValue.name,
                    remark: good.product.remark,
                    producer_id: producer.id,
                    producer_name: producer.name,
                    store_id: store.id,
                    store_name: store.name,
                    company_id: this._company.id,
                    party_name: this._company.party.name,
                    pack: good.pack,
                    id: 0,
                    multiple: good.multiply,
                    good_id: good.id,
                    currency_id: currency.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                    actual: new Date(),
                    with_vat: 1,
                    vat: good.product.vat
                };
                const item_min = item.moq > item.quant ? item.quant : item.moq;
                if (item.quant > 0) {
                    const old_prices = await Price.findAll({ where: { good_id: good.id }});
                    for (let i = 0; i < 5; i++) {
                        let min = item_min < item.pricebreaks[i].quant ? item.pricebreaks[i].quant : item_min;
                        if (
                            min * item.pricebreaks[i].price / item.price_unit < min_sum &&
                            item.pricebreaks[i].price / item.price_unit * item.quant > min_sum
                        ) {
                            min = Math.ceil(min_sum / (item.pricebreaks[i].price / item.price_unit));
                        }
                        const max = i === 4 ? item.quant : item.pricebreaks[i + 1].quant - 1;
                        const our_price = (item.pricebreaks[i].price) / (item.price_unit);
                        const for_all_price = (item.pricebreaks[i].pureprice) / (item.price_unit);
                        prices.push(Object.assign({
                            average_days: days,
                            ballance: item.quant,
                            min: min,
                            max: max,
                            our_price: our_price,
                            for_all_price: for_all_price,
                            online: 1
                        }, base_price));
                        if (old_prices.length > 0) {
                            old_prices[i].set(
                                {
                                    min: min,
                                    max: max,
                                    our_price: our_price,
                                    for_all_price: for_all_price
                                }
                            );
                            await price_service.update(old_prices[i]);
                        } else {
                            await price_service.create({
                                currency_id: currency.id,
                                good_id: good.id,
                                min: min,
                                max: max,
                                our_price: our_price,
                                for_all_price: for_all_price
                            });
                        }
                    }
                }
                if (item.vendors) {
                    item.vendors.forEach(vendor => {
                        if (vendor.pricebreaks) {
                            let max = vendor.quant;
                            vendor.pricebreaks.reverse().forEach(pricebreak => {
                                prices.push(Object.assign({
                                    average_days: days + vendor.delivery,
                                    ballance: vendor.quant,
                                    min: pricebreak.quant,
                                    max: max,
                                    our_price: pricebreak.price,
                                    for_all_price: 0,
                                    online: vendor.delivery
                                }, base_price));
                                max = pricebreak.quant - 1;
                            });
                        }
                    });
                }
                resolve(prices);
            }))
        );
        return [].concat(...ret);
    }
}
