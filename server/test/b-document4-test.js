import _ from 'lodash';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Invoice', () => {
    let promelec;
    let producer;
    let product;
    let elcopro;
    let elcoproStore;
    let good;
    let dan;
    let danStore;
    let goodDan;
    const {
        Company, Good, Invoice, Producer, Product, DocumentLine, TransferIn,
    } = app.services.db.models;
    const { transition } = app.services;
    before(async () => {
        promelec = await Company.getByAlias('promelec');
        producer = await Producer.getInstance({ name: 'TEST' });
        product = await Product.getInstance({ name: 'TEST', producer_id: producer.id });
        elcopro = await Company.getByAlias('elcopro');
        elcoproStore = _.find(elcopro.stores, { is_main: true });
        good = await Good.getInstance({ product_id: product.id, store_id: elcoproStore.id });
        dan = await Company.getByAlias('dan');
        danStore = _.find(dan.stores, { is_main: true });
        goodDan = await Good.getInstance({ product_id: product.id, store_id: danStore.id });
    });
    it('Create Invoice', async () => Invoice.createFromOptics({
        sellerable_id: elcopro.id,
        buyerable_id: promelec.id,
        number_prefix: 'TEST',
    }).then((res) => {
        expect(
            res,
            `Invoice is object with sellerable_id = ${elcopro.id}
                , buyerable_id = ${promelec.id}, prefix = 'TEST'`,
        )
            .to.be.an.instanceof(Invoice)
            .and.deep.include(
                { sellerable_id: elcopro.id, buyerable_id: promelec.id, number_prefix: 'TEST' },
            );
    }));
    it('Create Second Invoice', async () => Invoice.createFromOptics({
        sellerable_id: elcopro.id,
        buyerable_id: promelec.id,
        number_prefix: 'TEST',
    }).then((res) => {
        expect(
            res,
            `Invoice is object with sellerable_id = ${elcopro.id}
                , buyerable_id = ${promelec.id}, prefix = 'TEST' & number = 2`,
        )
            .to.be.an.instanceof(Invoice)
            .and.deep.include(
                {
                    sellerable_id: elcopro.id, buyerable_id: promelec.id, number_prefix: 'TEST', number: 2,
                },
            );
    }));
    it('Create TEST DocumentLine with TEST Good from Dan Store in TEST Invoice', async () => {
        const invoice = await Invoice.getInstance({ number: 1, number_prefix: 'TEST' });
        const line = await DocumentLine.create({
            document_id: invoice.id,
            times: 10,
            good_id: goodDan.id,
            quantity: 1,
            vat: 20,
            price_without_vat: 20,
            remark: 'TEST',
        });
        expect(line, `It DocumentLine where document_id=${invoice.id}, good_id=${good.id}, from_good_id=${goodDan.id}`)
            .to.be.an.instanceof(DocumentLine)
            .and.deep.include(
                {
                    document_id: invoice.id, good_id: good.id, from_good_id: goodDan.id,
                },
            );
    });
    it('Create TEST DocumentLine with TEST Good from our Store in TEST Invoice', async () => {
        const invoice = await Invoice.getInstance({ number: 1, number_prefix: 'TEST' });
        return DocumentLine.create({
            document_id: invoice.id,
            times: 1,
            good_id: good.id,
            quantity: 4,
            vat: 20,
            price_without_vat: 20,
            remark: 'TEST',
        }).then((res) => {
            expect(res, `It DocumentLine where document_id=${invoice.id}, good_id=${good.id}, from_good_id=${good.id}`)
                .to.be.an.instanceof(DocumentLine)
                .and.deep.include(
                    {
                        document_id: invoice.id, good_id: good.id, from_good_id: good.id,
                    },
                );
        });
    });
    it('Invoice transition "reserve"', async () => {
        const invoice = await Invoice.getInstance({ number: 1, number_prefix: 'TEST' });
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
    it('Remove first arrival with exeption', async () => {
        const transfer = await TransferIn.getInstance({ number_prefix: 'TEST', status_id: 'in_work' });
        return expect(transition.execute('unWork', transfer), 'Check reserves & departures')
            .to.be.rejectedWith(Error, 'Check reserves & departures');
    });
    it('Invoice transition "unreserve"', async () => {
        const invoice = await Invoice.getInstance({ number: 1, number_prefix: 'TEST' });
        const res = await transition.execute('unreserve', invoice);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(invoice.status_id).to.equal('formed');
        const newGood = await Good.getInstance({ product_id: product.id, store_id: elcoproStore.id });
        expect(good.quantity).to.equal(newGood.quantity);
    });
});
