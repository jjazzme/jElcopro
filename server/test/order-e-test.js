import _ from 'lodash';
import CompanyService from '../services/CompanyService';
import InvoiceService from '../services/InvoiceService';
import TransferInService from '../services/TransferInService';
import {
    DocumentLine, FutureReserve, Reserve, TransferIn,
} from '../models';
import OrderService from '../services/OrderService';
import ProducerService from '../services/ProducerService';
import ProductService from '../services/ProductService';
import GoodService from '../services/GoodService';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Invoice 1', () => {
    let elcopro;
    let elcoproStore;
    let good;
    let goodService;
    let invoice;
    let service;
    let orderService;
    let order;
    let transferInService;
    let promelec;
    let promelecStore;
    let product;
    let producer;
    before(async () => {
        promelec = await (new CompanyService()).getByAlias('promelec');
        promelecStore = _.find(promelec.stores, { is_main: true });
        elcopro = await (new CompanyService()).getByAlias('elcopro');
        elcoproStore = _.find(elcopro.stores, { is_main: true });
        service = new InvoiceService();
        orderService = new OrderService();
        order = await orderService.find({ number: 1, number_prefix: 'TEST' });
        transferInService = new TransferInService();
        invoice = await service.find({
            number: '1',
            user_id: 1,
            sellerable_id: elcopro.id,
            buyerable_id: promelec.id,
            store_id: elcoproStore.id,
            foreign_store_id: promelecStore.id,
            number_prefix: 'TEST',
        });
        producer = await (new ProducerService()).find({ name: 'TEST' });
        product = await (new ProductService()).find({ name: 'TEST', producer_id: producer.id });
        goodService = new GoodService();
        good = await goodService.find({ product_id: product.id, store_id: elcoproStore.id });
    });
    it('Invoice transition "reserve"', async () => {
        await service.setInstance(invoice);
        const res = await service.transition('reserve', { own: true });
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(service.instance.status_id).to.equal('reserved');
        const lines = (await service.find(service.instance)).documentLines;
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
        const child = await transferInService.createTransferIn({
            parent_id: order.id,
            number: 2,
            number_prefix: 'TEST',
            user_id: 1,
        });
        expect(child, 'Child - formed TransferIn')
            .to.be.an.instanceof(TransferIn).and.deep.include({ status_id: 'formed' });
    });
    it('Make second arrival', async () => {
        const transfer = await transferInService.find({ number: 2, number_prefix: 'TEST', parent_id: order.id });
        await transferInService.setInstance(transfer);
        const res = await transferInService.transition('toWork');
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(transferInService.instance.status_id).to.equal('in_work');
        good = await goodService.find({ id: good.id });
        expect(good.ballance).is.equal(7);
        const reserves = await Reserve.findAll({
            include: [{ model: DocumentLine, as: 'documentLine', where: { good_id: good.id } }],
        });
        expect(reserves.length).is.equal(3);
        expect(reserves.reduce((sum, reserve) => sum + reserve.quantity, 0)).is.equal(5);
        const frs = await FutureReserve.findAll({
            include: [{ model: DocumentLine, as: 'documentLine', where: { good_id: good.id } }],
        });
        expect(frs.length).is.equal(0);
    });
    it('Invoice transition "unreserve" with exeption', async () => {
        const error = 'TEST подоbран, снять резерв не возможно';
        await service.closeReserves(invoice);
        return expect(service.transition('unreserve'), error).to.be.rejectedWith(Error, error);
    });
});
