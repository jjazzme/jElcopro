import _ from 'lodash';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-string'));

const { expect } = chai;

describe('TEST Order create with one DocumentLine with TEST Product', () => {
    let dan; let danStore; let producer; let product; let elcopro; let elcoproStore; let order; let good;
    const {
        Company, DocumentLine, Good, Order, Product, Producer,
    } = app.services.db.models;
    before(async () => {
        await app.services.auth.authorize();
        dan = await Company.getByAlias('dan');
        danStore = _.find(dan.stores, { is_main: true });
        producer = await Producer.getRightInstanceOrCreate({ name: 'TEST' });
        product = await Product.getRightInstanceOrCreate({ name: 'TEST', producer_id: producer.id }, 'withProducer');
        elcopro = await Company.getByAlias('elcopro');
        elcoproStore = _.find(elcopro.stores, { is_main: true });
    });
    it('Create TEST Good on Main Dan Store', async () => Good.getInstanceOrCreate(
        { product_id: product.id, store_id: danStore.id, code: product.id },
        {
            pack: 1, multiply: 1, is_active: true, ballance: 0,
        },
    ).then((res) => {
        good = res;
        expect(
            res,
            `Good is object with properties: product_id = ${product.id}
                , store_id = ${danStore.id}, code = ${product.id}`,
        )
            .to.be.an.instanceof(Good)
            .and.deep.include(
                { product_id: product.id, store_id: danStore.id, code: product.id.toString() },
            );
    }));
    it('Create TEST Order', async () => Order.createFromOptics({
        sellerable_id: dan.id,
        buyerable_id: elcopro.id,
        store_id: elcoproStore.id,
        number_prefix: 'TEST',
    }).then((res) => {
        order = res;
        expect(
            res,
            `Order is object with sellerable_id = ${dan.id}
                , buyerable_id = ${elcopro.id}, prefix = 'TEST'`,
        )
            .to.be.an.instanceof(Order)
            .and.deep.include(
                { sellerable_id: dan.id, buyerable_id: elcopro.id, number_prefix: 'TEST' },
            );
    }));
    it('TEST Order is inclusive', async () => Order.findAll({
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
    }));
    it(
        'Create TEST DocumentLine with TEST Good in TEST Order',
        async () => {
            const rightGood = await Good.getInstance({ product_id: product.id, store_id: elcoproStore.id });
            return DocumentLine.create({
                document_id: order.id,
                times: 10,
                good_id: good.id,
                quantity: 10,
                vat: 20,
                price_without_vat: 10,
                remark: 'TEST',
            }).then((res) => {
                expect(res, `It DocumentLine where document_id=${order.id}, good_id=${rightGood.id}
            , store_id=${elcoproStore.id}, from_good_id=${elcoproStore.id}`)
                    .to.be.an.instanceof(DocumentLine)
                    .and.deep.include({
                        document_id: order.id, good_id: rightGood.id, store_id: elcoproStore.id, from_good_id: good.id,
                    });
            });
        },
    );
});
