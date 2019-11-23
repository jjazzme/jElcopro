import _ from 'lodash';
import axios from 'axios';

export default class CompelService {
    constructor(config, db) {
        this.db = db;
        this.compel = config.companies.compel;
    }

    /**
     * Concat item proposals where the same item_id
     * @param {Array} items
     * @returns {Array}
     * @private
     */
    // eslint-disable-next-line class-methods-use-this
    _clearItems(items) {
        return items.reduce((state, item) => {
            const rightItem = _.find(state, { item_id: item.item_id });
            if (rightItem) {
                rightItem.proposals = rightItem.proposals.concat(item.proposals);
            } else {
                state.push(item);
            }
            return state;
        }, []);
    }

    /**
     *  Get quantity from proposal
     * @param {Object} proposal
     * @returns {int}
     * @private
     */
    // eslint-disable-next-line class-methods-use-this
    _getQuantity(proposal) {
        /*
         *  Quantity for DMS possible will be in last price as max
         */
        let qty = proposal.vend_qty;
        if (qty === 0 && proposal.price_qty.length > 0) {
            qty = _.last(proposal.price_qty).max_qty;
        }
        return qty;
    }

    /**
     * Parse Compel Api Item
     * @param {Object} item
     * @param {ParameterName} case_
     * @param {Store} store
     * @returns {Promise<{product: *, parameter: *, package_: *, producer: *, good: *}>}
     * @private
     */
    async _parseApiItem(item, case_, store) {
        const {
            Producer, Product, Parameter, ParameterValue, Good,
        } = this.db.models;
        let producer = await Producer.getRightInstance({ name: item.item_brend });
        if (!producer) producer = await Producer.create({ name: item.item_brend });
        let product = await Product.getRightInstance({ name: item.item_name, producer_id: producer.id });
        if (!product) product = await Product.create({ name: item.item_name, producer_id: producer.id });
        // eslint-disable-next-line no-underscore-dangle
        let package_ = await ParameterValue.getRightInstance(
            { name: item.package_name, parameter_name_id: case_.id },
        );
        // eslint-disable-next-line no-const-assign
        if (!package_) package_ = await ParameterValue.create({ name: item.package_name, parameter_name_id: case_.id });
        let parameter = await Parameter.getInstance({ parameter_name_id: case_.id, product_id: product.id });
        if (!parameter) {
            parameter = await Parameter.create({
                parameter_name_id: case_.id, product_id: product.id, parameter_value_id: package_.id,
            });
        }
        const newItem = item.proposals[0].location_id !== 'CENTRE' ? {}
            : {
                ballance: this._getQuantity(item.proposals[0]),
                pack: item.qty_in_pack,
                multiply: item.proposals[0].mpq === 0 ? 1 : item.proposals[0].mpq,
            };
        let good = await Good.getInstance({ store_id: store.id, code: item.item_id, product_id: product.id });
        if (!good) {
            good = await Good.create({
                store_id: store.id, code: item.item_id, product_id: product.id, ...newItem,
            });
        } else {
            good.update(newItem);
        }
        return {
            producer, product, package_, parameter, good,
        };
    }

    /**
     * Compel API Method
     * @param {string} method
     * @param {Object} params
     * @returns {Promise<*>}
     */
    // eslint-disable-next-line class-methods-use-this
    async method(method, params) {
        // eslint-disable-next-line no-param-reassign
        params.user_hash = this.compel.api_hash;
        const response = await axios.post(
            this.compel.api_url,
            {
                id: 1,
                method,
                params,
            },
        );
        return response.data;
    }

    /**
     * Use Api Method search_item_ext with name
     * @param {string} name
     * @param {boolean} [deep = false]
     * @returns {Promise<*>}
     */
    async apiSearchByName(name, deep = false) {
        const searchName = deep ? `*${name.toString().trim()}` : name.toString();
        const response = await this.method('search_item_ext', { query_string: `${searchName}*` });
        return response.result;
    }

    /**
     * Use Api Method search_item_ext with id ( compel code )
     * @param {string} id - compel product id(code)
     * @returns {Promise<*>}
     */
    async apiSearchById(id) {
        const response = await this.method('search_item_ext', { item_id_search: id });
        return response.result;
    }

    /**
     * Parse Compel Api answer to price objects
     * @param result
     * @param days
     * @returns {Promise<Array>}
     */
    async parseApiAnswer(result, days = 6) {
        const {
            Currency, ParameterName, Company, Price,
        } = this.db.models;
        const currency = await Currency.getInstance({ cahr_code: result.currency });
        // eslint-disable-next-line no-underscore-dangle
        const case_ = await ParameterName.getInstance({ alias: 'case' });
        const company = await Company.getByAlias('compel');
        const store = _.find(company.stores, { is_main: true });
        const items = this._clearItems(result.items);
        const ret = await Promise.all(
            // eslint-disable-next-line no-async-promise-executor,no-unused-vars
            items.map((item) => new Promise(async (resolve, reject) => {
                const { good, parameter, producer } = await this._parseApiItem(item, case_, store);
                const pmss = [].concat(...item.proposals.map((proposal) => proposal.price_qty.map(async (price) => {
                    let id = 0;
                    if (proposal.prognosis_days === 1) {
                        const oldPrice = await Price.findOne({ where: { good_id: good.id, min: price.min_qty } });
                        if (oldPrice) {
                            oldPrice.our_price = price.price;
                            await oldPrice.save();
                            id = oldPrice.id;
                        }
                    }
                    return {
                        code: item.item_id,
                        product_id: good.product_id,
                        picture: good.product.picture,
                        name: good.product.name,
                        parameter_id: parameter ? parameter.id : null,
                        case: parameter ? parameter.parameterValue.name : '',
                        remark: good.product.remark,
                        producer_id: producer.id,
                        producer_name: producer.name,
                        store_id: good.store.id,
                        store_name: good.store.name,
                        company_id: this._company.id,
                        party_name: this._company.party.name,
                        pos: item.pos,
                        pack: item.qty_in_pack,
                        id,
                        multiply: proposal.mpq === 0 ? 1 : proposal.mpq,
                        average_days: days + proposal.prognosis_days - 1,
                        good_id: good.id,
                        ballance: this._getQuantity(proposal),
                        min: price.min_qty,
                        max: price.max_qty === 0 ? this._getQuantity(proposal) : price.max_qty,
                        currency_id: currency.id,
                        our_price: price.price,
                        for_all_price: 0,
                        created_at: new Date(),
                        updated_at: new Date(),
                        actual: new Date(),
                        online: proposal.prognosis_days, // ???
                        with_vat: 1,
                        vat: good.product.vat,
                        /*
                             * то что ниже нужно для оформления заказа с дмс
                             */
                        prognosis_days: proposal.prognosis_days,
                        prognosis_id: proposal.prognosis_id,
                        prognosis_description: proposal.prognosis_description,
                        vend_type: proposal.vend_type,
                        vend_proposal_date: proposal.vend_proposal_date,
                    };
                })));
                const r = await Promise.all(pmss);
                resolve(r);
            })),
        );
        return [].concat(...ret);
    }
}
