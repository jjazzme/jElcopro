import _ from 'lodash';
import DocumentLineService from '../services/DocumentLineService';
import CompanyService from '../services/CompanyService';
import InvoiceService from '../services/InvoiceService';
import TransferInService from '../services/TransferInService';
import { TransferIn } from '../models';
import OrderService from '../services/OrderService';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Invoice 1', () => {
    let elcopro;
    let elcoproStore;
    let invoice;
    let service;
    let orderService;
    let order;
    let transferInService;
    let promelec;
    let promelecStore;
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
    });
    it('Invoice transition "reserve"', async () => {
        await service.setInstance(invoice);
        const res = await service.transition('reserve', { own: true });
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(service.instance.status_id).to.equal('reserved');
        const line = await (new DocumentLineService()).find({ id: _.first(service.instance.documentLines).id });
        expect(line.reserves[0].quantity).to.equal(2);
        expect(line.futureReserve.ballance).to.equal(2);
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
});
