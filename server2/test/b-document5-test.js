import _ from 'lodash';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Invoice', () => {
    let elcopro;
    let elcoproStore;
    let good;
    let invoice;
    let order;
    let promelec;
    let promelecStore;
    let product;
    let producer;
    const {
        Company, Good, Invoice, Order, Producer, Product, TransferIn,
    } = app.services.db.models;
    const { transition } = app.services;
    before(async () => {
        promelec = await Company.getByAlias('promelec');
        promelecStore = _.find(promelec.stores, { is_main: true });
        elcopro = await Company.getByAlias('elcopro');
        elcoproStore = _.find(elcopro.stores, { is_main: true });
        order = await Order.getInstance({ number: 1, number_prefix: 'TEST' });
        invoice = await Invoice.getInstance({ number: 1, number_prefix: 'TEST' });
        producer = await Producer.getInstance({ name: 'TEST' });
        product = await Product.getInstance({ name: 'TEST', producer_id: producer.id });
        good = await Good.getInstance({ product_id: product.id, store_id: elcoproStore.id });
    });
    it('Invoice transition "reserve"', async () => {
        const res = await transition.execute('reserve', invoice, { own: true });
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(invoice.status_id).to.equal('reserved');
        const lines = await invoice.getDocumentLines({ scope: ['withReserves', 'withFutureReserve'] });
        lines.forEach((line) => {
            if (line.times === 10) {
                // eslint-disable-next-line no-unused-expressions
                expect(line.reserves).is.empty;
                expect(line.futureReserve.ballance).to.equal(1);
            } else {
                expect(line.reserves[0].quantity).to.equal(2);
                expect(line.futureReserve.ballance).to.equal(2);
            }
        });
    });
    it('Create child TransferIn', async () => {
        const child = await TransferIn.createFromOptics({ parent_id: order.id, number_prefix: 'TEST' });
        expect(child, 'Child - formed TransferIn')
            .to.be.an.instanceof(TransferIn).and.deep.include({ status_id: 'formed' });
    });
});
