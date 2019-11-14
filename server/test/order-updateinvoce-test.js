import _ from 'lodash';
import InvoiceService from '../services/InvoiceService';
import { DocumentLine, Invoice } from '../models';
import CompanyService from '../services/CompanyService';
import ProducerService from '../services/ProducerService';
import ProductService from '../services/ProductService';
import GoodService from '../services/GoodService';
import DocumentLineService from '../services/DocumentLineService';
import TransferInService from '../services/TransferInService';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Invoice', () => {
    let elcopro;
    let elcoproStore;
    let good;
    let producer;
    let product;
    let promelec;
    let promelecStore;
    let service;
    let transferService;
    before(async () => {
        promelec = await (new CompanyService()).getByAlias('promelec');
        promelecStore = _.find(promelec.stores, { is_main: true });
        producer = await (new ProducerService()).find({ name: 'TEST' });
        product = await (new ProductService()).find({ name: 'TEST', producer_id: producer.id });
        elcopro = await (new CompanyService()).getByAlias('elcopro');
        elcoproStore = _.find(elcopro.stores, { is_main: true });
        service = new InvoiceService();
        transferService = new TransferInService();
        good = await (new GoodService()).find({ product_id: product.id, store_id: elcoproStore.id });
    });
    it('Create Invoice', async () => service.firstOrCreate({
        number: '1',
        user_id: 1,
        sellerable_id: elcopro.id,
        buyerable_id: promelec.id,
        store_id: elcoproStore.id,
        foreign_store_id: promelecStore.id,
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
    it('Create TEST DocumentLine with TEST Good from our Store in TEST Invoice', async () => {
        const invoice = await service.find({
            number: '1',
            user_id: 1,
            sellerable_id: elcopro.id,
            buyerable_id: promelec.id,
            store_id: elcoproStore.id,
            foreign_store_id: promelecStore.id,
            number_prefix: 'TEST',
        });
        const documenLineService = new DocumentLineService();
        return documenLineService.firstOrCreate({
            document_id: invoice.id,
            times: 10,
        }, {
            good_id: good.id,
            quantity: 4,
            vat: 20,
            price_without_vat: 20,
            price_with_vat: 24,
            amount_without_vat: 80,
            amount_with_vat: 96,
            store_id: elcoproStore.id,
            remark: 'TEST',
        }).then((res) => {
            expect(res, `It DocumentLine where document_id=${invoice.id}, good_id=${good.id}
            , store_id=${elcoproStore.id}, from_good_id=${elcoproStore.id}`)
                .to.be.an.instanceof(DocumentLine)
                .and.deep.include(
                    {
                        document_id: invoice.id, good_id: good.id, store_id: elcoproStore.id, from_good_id: good.id,
                    },
                );
        });
    });
    it('Invoice transition "reserve"', async () => {
        const invoice = await service.find({
            number: '1',
            user_id: 1,
            sellerable_id: elcopro.id,
            buyerable_id: promelec.id,
            store_id: elcoproStore.id,
            foreign_store_id: promelecStore.id,
            number_prefix: 'TEST',
        });
        await service.setInstance(invoice);
        const res = await service.transition('reserve', { own: true });
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(service.instance.status_id).to.equal('reserved');
        const line = await (new DocumentLineService()).find({ id: _.first(service.instance.documentLines).id });
        expect(line.reserves[0].quantity).to.equal(2);
        expect(line.futureReserve.ballance).to.equal(2);
    });

    it('Remove first arrival with exeption', async () => {
        const transfer = await transferService.find({ number_prefix: 'TEST', status_id: 'in_work' });
        await transferService.setInstance(transfer);
        return expect(transferService.transition('unWork'), 'Check reserves & departures')
            .to.be.rejectedWith(Error, 'Check reserves & departures');
    });
    it('Invoice transition "unreserve"', async () => {
        const invoice = await service.find({
            number: '1',
            user_id: 1,
            sellerable_id: elcopro.id,
            buyerable_id: promelec.id,
            store_id: elcoproStore.id,
            foreign_store_id: promelecStore.id,
            number_prefix: 'TEST',
        });
        await service.setInstance(invoice);
        const res = await service.transition('unreserve');
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(service.instance.status_id).to.equal('formed');
        const newGood = await (new GoodService()).find({ product_id: product.id, store_id: elcoproStore.id });
        expect(good.quantity).to.equal(newGood.quantity);
    });
});
