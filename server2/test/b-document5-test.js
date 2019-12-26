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
    let product;
    let producer;
    const {
        Company, Good, Invoice, Order, Producer, Product, TransferIn, TransferOut, Reserve, DocumentLine,
        FutureReserve, TransferOutCorrective,
    } = app.services.db.models;
    const { transition } = app.services;
    before(async () => {
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
    it('Test invoice closeReserves with exeption',
        async () => expect(transition.execute('closeReserves', invoice), 'Счет должен быть в работе')
            .to.be.rejectedWith(
                Error,
                '[object SequelizeInstance:Invoice] transition closeReserves is impossible for reserved status',
            ));
    it('Create first transferOut', async () => {
        await transition.execute('toWork', invoice);
        await transition.execute('closeReserves', invoice); // invoice.closeReserves();
        const out = await TransferOut.createFromOptics({ parent_id: invoice.id, number_prefix: 'TEST' });
        expect(out, 'TranserOut')
            .to.be.an.instanceof(TransferOut).and.deep.include({ status_id: 'formed' });
        const line = _.first(await out.getDocumentLines());
        expect(line, 'Amount with vat 48')
            .to.be.an.instanceof(DocumentLine).and.deep.include({ amount_with_vat: 48 });
    });
    it('TransfeOut transition test', async () => {
        const transferOut = await TransferOut.getInstance({ number_prefix: 'TEST' });
        await transition.execute('toWork', transferOut);
        expect(transferOut, 'It is TransferOut')
            .to.be.an.instanceof(TransferOut).and.deep.include({ status_id: 'in_work' });
    });
    it('Make TransferOutCorrective', async () => {
        const transferIn = await TransferIn
            .getInstance({ number: 2, number_prefix: 'TEST', parent_id: order.id }, 'withDocumentLines');
        const transferOutCorrective = await TransferOutCorrective.createFromOptics({
            parent_id: transferIn.id, number_prefix: 'TEST', parentLines: transferIn.documentLines,
        });
        expect(transferOutCorrective, 'It is TransferOutCorrective')
            .to.be.an.instanceof(TransferOutCorrective).and.deep.include({ status_id: 'formed' });
        await transferOutCorrective.documentLines[0].update({ quantity: 8 });
        await transition.execute('reserve', transferOutCorrective);
    });
    it('Make second arrival', async () => {
        const transferIn = await TransferIn
            .getInstance({ number: 2, number_prefix: 'TEST', parent_id: order.id });
        const res = await transition.execute('toWork', transferIn);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(transferIn.status_id).to.equal('in_work');
        good = await Good.getInstance(good.id);
        expect(good.ballance).is.equal(0);
        const reserves = await Reserve.findAll({
            include: [{ model: DocumentLine, as: 'documentLine', where: { good_id: good.id } }],
        });
        expect(reserves.length).is.equal(3);
        expect(reserves.reduce((sum, reserve) => sum + reserve.quantity, 0)).is.equal(10);
        const frs = await FutureReserve.findAll({
            include: [{ model: DocumentLine, as: 'documentLine', where: { good_id: good.id } }],
        });
        expect(frs.length).is.equal(1);
    });
    it('Invoice transition "unreserve" with exeption', async () => {
        const error = 'TEST подоbран, снять резерв не возможно';
        await transition.execute('closeReserves', invoice); // await invoice.closeReserves(invoice);
        await transition.execute('unWork', invoice);
        return expect(transition.execute('unreserve', invoice), error).to.be.rejectedWith(Error, error);
    });
});
