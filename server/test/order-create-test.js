import _ from 'lodash';
import CompanyService from '../services/CompanyService';
import ProducerService from '../services/ProducerService';
import ProductService from '../services/ProductService';
import GoodService from '../services/GoodService';
import { DocumentLine, Good, Order } from '../models';
import OrderService from '../services/OrderService';
import DocumentLineService from '../services/DocumentLineService';

const chai = require('chai');
chai.use(require('chai-string'));

const { expect } = chai;

describe('TEST Order create with one DocumentLine with TEST Product', () => {
    let dan, danStore, producer, product, elcopro, elcoproStore;
    before(async () => {
        dan = await (new CompanyService()).getByAlias('dan');
        danStore = _.find(dan.stores, { is_main: true });
        producer = await (new ProducerService()).find({ name: 'TEST' });
        product = await (new ProductService()).find({ name: 'TEST', producer_id: producer.id });
        elcopro = await (new CompanyService()).getByAlias('elcopro');
        elcoproStore = _.find(elcopro.stores, { is_main: true });

    });
    it('Create TEST Good on Main Dan Store', async () => {
        const service = new GoodService();
        return service.firstOrCreate(
            {
                product_id: product.id,
                store_id: danStore.id,
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
                , store_id = ${danStore.id}, code = ${product.id}`,
            )
                .to.be.an.instanceof(Good)
                .and.deep.include(
                    { product_id: product.id, store_id: danStore.id, code: product.id.toString() },
                );
        });
    });
    it('Create TEST Order', async () => {
        const service = new OrderService();
        return service.firstOrCreate({
            number: '1',
            user_id: 1,
            sellerable_id: dan.id,
            buyerable_id: elcopro.id,
            store_id: elcoproStore.id,
            foreign_store_id: danStore.id,
            number_prefix: 'TEST',
        }).then((res) => {
            expect(
                res,
                `Order is object with sellerable_id = ${dan.id}
                , buyerable_id = ${elcopro.id}, prefix = 'TEST'`,
            )
                .to.be.an.instanceof(Order)
                .and.deep.include(
                    { sellerable_id: dan.id, buyerable_id: elcopro.id, number_prefix: 'TEST' },
                );
        });
    });
    it('TEST Order is inclusive', async () => {
        return Order.findAll({
            where: {
                number: '1',
                user_id: 1,
                sellerable_id: dan.id,
                buyerable_id: elcopro.id,
                store_id: elcoproStore.id,
                foreign_store_id: danStore.id,
                number_prefix: 'TEST',
            },
        }).then((res) => {
            expect(res, 'Array with one element').to.be.an('array').that.to.have.lengthOf(1);
            expect(res[0], 'An this element is Order').to.be.an.instanceof(Order);
        });
    });
    it('Create TEST DocumentLine with TEST Good in TEST Order', async () => {
        const order = await (new OrderService()).find({
            number: '1',
            user_id: 1,
            sellerable_id: dan.id,
            buyerable_id: elcopro.id,
            store_id: elcoproStore.id,
            foreign_store_id: danStore.id,
            number_prefix: 'TEST',
        });
        const good = await (new GoodService()).find({ product_id: product.id, store_id: danStore.id });
        const rightGood = await (new GoodService()).find({ product_id: product.id, store_id: elcoproStore.id });
        const service = new DocumentLineService();
        return service.firstOrCreate({
            document_id: order.id,
            times: 10,
        }, {
            good_id: good.id,
            quantity: 10,
            vat: 20,
            price_without_vat: 10,
            price_with_vat: 12,
            amount_without_vat: 100,
            amount_with_vat: 120,
            store_id: danStore.id,
            remark: 'TEST',
        }).then((res) => {
            expect(res, `It DocumentLine where document_id=${order.id}, good_id=${rightGood.id}
            , store_id=${elcoproStore.id}, from_good_id=${elcoproStore.id}`)
                .to.be.an.instanceof(DocumentLine)
                .and.deep.include(
                    {
                        document_id: order.id, good_id: rightGood.id, store_id: elcoproStore.id, from_good_id: good.id,
                    },
                );
        });
    });
});
