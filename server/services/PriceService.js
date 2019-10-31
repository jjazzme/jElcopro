'use strict';

import _ from 'lodash';
import Entity from './Entity';
import {
    Currency,
    Company,
    Good,
    InterStoreRoute,
    Parameter,
    ParameterValue,
    Party,
    Price,
    Producer,
    Product,
    Store
} from '../models';
import ParameterNameService from "./ParameterNameService";
import ProductService from "./ProductService";
import Sequelize from "sequelize";
import CompanyService from "./CompanyService";

export default class PriceService extends Entity {

    /**
     *
     */
    _Op = Sequelize.Op;

    /**
     * Product Template
     * @type {{include: *[], as: string, model: *, required: boolean}}
     * @private
     */
    _product = {
        model: Product,
        as: 'product',
        required: true,
        include: [
            { model: Producer, as: 'producer' },
            {
                model: Parameter,
                as: 'parameters',
                //where: { parameter_name_id: case_.id },
                include: [
                    { model: ParameterValue, as: 'parameterValue' }
                ]
            }
        ]
    };

    /**
     * Store template
     * @type {{include: *[], as: string, model: *}}
     * @private
     */
    _store = {
        model: Store,
        as: 'store',
        include: [
            {
                model: Company,
                as: 'company',
                where: { },
                required: true,
                include: [
                    { model: Party, as: 'party' }
                ]
            },
            {
                model: InterStoreRoute,
                as: 'fromRoutes',
                //where: { to_store_id: store.id, is_active: true }
            }
        ]

    };

    constructor() {
        super(Price);
        this._includes = [{ model: Currency, as: 'currency' }]
    }

    async searchByName(query) {
        if (!query || !query.name || query.name.length < 3) return [];
        //
        const searchName = ProductService.makeSearchName(query.name);
        this._product.where = { name: { [this._Op.substring]: searchName } };
        const case_ = await (new ParameterNameService()).getByAlias('case');
        _.find(this._product.include, { as: 'parameters' }).where = { parameter_name_id: case_.id };
        //
        let store = query.store;
        if (!store) {
            const company = await (new CompanyService()).getByAlias('elcopro');
            store = _.find(company.stores, {is_main: true});
        }
        _.find(this._store.include, { as: 'fromRoutes' }).where = { to_store_id: store.id, is_active: true };
        if (query.online !== null && query.online !== undefined) {
            this._store.where.online = query.online;
        }
        if (query.from_store_ids) {
            this._store.where.id = { [this._Op.in]: query.from_store_ids };
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
                    include: [ this._store, this._product ]
                }
            ]
        });
        return prices.map(price => {
            return Object.assign({
                code: price.good.code,
                product_id: price.good.product_id,
                picture: price.good.product.picture,
                name: price.good.product.name,
                parameter_id: price.good.product.parameters.length > 0 ? price.good.product.parameters[0].id : null,
                case: price.good.product.parameters.length > 0 ?
                    price.good.product.parameters[0].parameterValue.name :
                    null,
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
                online: 0
            },  _.omit(price.dataValues, ['good', 'currency']));
        })
    }

};