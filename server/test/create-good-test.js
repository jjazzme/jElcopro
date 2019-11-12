import { expect } from 'chai';
import _ from 'lodash';
import ProducerService from '../services/ProducerService';
import ParameterNameService from '../services/ParameterNameService';
import ParameterValueService from '../services/ParameterValueService';
import {
    Good, Parameter, ParameterValue, Producer, Product,
} from '../models';
import ProductService from '../services/ProductService';
import ParameterService from '../services/ParameterService';
import CompanyService from '../services/CompanyService';
import GoodService from '../services/GoodService';

require('../config/config.js');

describe('Create or Find TEST Good on ElcoPro Main Store:', () => {
    it('Create Or first TEST Producer', async () => {
        const service = new ProducerService();
        return service.firstOrCreate({ name: 'TEST' })
            .then((res) => {
                expect(res, 'Producer is object with name property equal TEST')
                    .to.be.an.instanceof(Producer).with.property('name').that.equal('TEST');
            });
    });
    it('Create Or first TEST ParameterValue with ParameterName - case', async () => {
        // eslint-disable-next-line no-underscore-dangle
        const case_ = await (new ParameterNameService()).getByAlias('case');
        const service = new ParameterValueService();
        return service.firstOrCreate({ name: 'TEST', parameter_name_id: case_.id })
            .then((res) => {
                expect(res, 'ParameterValue is object with name property equal TEST')
                    .to.be.an.instanceof(ParameterValue).with.property('name').that.equal('TEST');
            });
    });
    it('Create TEST Product with TEST Producer', async () => {
        const producer = await (new ProducerService()).find({ name: 'TEST' });
        const service = new ProductService();
        return service.firstOrCreate({ name: 'TEST', producer_id: producer.id })
            .then((res) => {
                expect(
                    res,
                    `Product is object with name property equal TEST and producer_id property equal ${producer.id}`,
                )
                    .to.be.an.instanceof(Product)
                    .and.deep.include({ name: 'TEST', producer_id: producer.id });
            });
    });
    it('Create TEST Parameter for TEST Product', async () => {
        // eslint-disable-next-line no-underscore-dangle
        const case_ = await (new ParameterNameService()).getByAlias('case');
        const parameterValue = await (new ParameterValueService())
            .find({ name: 'TEST', parameter_name_id: case_.id });
        const producer = await (new ProducerService()).find({ name: 'TEST' });
        const product = await (new ProductService()).find({ name: 'TEST', producer_id: producer.id });
        const service = new ParameterService();
        return service.firstOrCreate(
            { product_id: product.id, parameter_name_id: case_.id, parameter_value_id: parameterValue.id },
        ).then((res) => {
            expect(
                res,
                `Parameter is object with properties: product_id = ${product.id}
                , parameter_value_id = ${parameterValue.id}, parameter_name_id = ${case_.id}`,
            )
                .to.be.an.instanceof(Parameter)
                .and.deep.include(
                    { product_id: product.id, parameter_name_id: case_.id, parameter_value_id: parameterValue.id },
                );
        });
    });
    it('Create TEST Good on Main ElcoPoro Store with upper data', async () => {
        const producer = await (new ProducerService()).find({ name: 'TEST' });
        const product = await (new ProductService()).find({ name: 'TEST', producer_id: producer.id });
        const elcopro = await (new CompanyService()).getByAlias('elcopro');
        const store = _.find(elcopro.stores, { is_main: true });
        const service = new GoodService();
        return service.firstOrCreate(
            {
                product_id: product.id,
                store_id: store.id,
                code: product.id,
            }, {
                pack: 1,
                multiply: 1,
                is_active: true,
                ballance: 0,
            },
        ).then((res) => {
            expect(
                res,
                `Good is object with properties: product_id = ${product.id}
                , store_id = ${store.id}, code = ${product.id}`,
            )
                .to.be.an.instanceof(Good)
                .and.deep.include(
                    { product_id: product.id, store_id: store.id, code: product.id.toString() },
                );
        });
    });
});
