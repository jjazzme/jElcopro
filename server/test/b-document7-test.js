import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Corrective', () => {
    let tinc;
    const {
        Invoice, TransferOut, TransferInCorrective,
    } = app.services.db.models;
    const { transition } = app.services;
    let invoice;
    before(async () => {
        invoice = await Invoice.getInstance({ number: 1, number_prefix: 'TEST' });
    });
    it('Second TransferOut & TranserInCorrective', async () => {
        await transition.execute('toWork', invoice);
        let out = await TransferOut.createFromOptics({ parent_id: invoice.id, number_prefix: 'TEST' });
        expect(out, 'TranserOut')
            .to.be.an.instanceof(TransferOut).and.deep.include({ status_id: 'formed' });
        out = await TransferOut.getInstance({ number: 1, number_prefix: 'TEST' }, 'withDocumentLines');
        tinc = await TransferInCorrective.createFromOptics({
            parent_id: out.id, number_prefix: 'TEST', parentLines: out.documentLines,
        });
        expect(tinc, 'TranserInCorrective')
            .to.be.an.instanceof(TransferInCorrective).and.deep.include({ status_id: 'formed' });
    });
    it('TranserInCorrective to work', async () => {
        const res = await transition.execute('toWork', tinc);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        const documentLines = await tinc.getDocumentLines({ scope: ['withArrival'] });
        expect(documentLines[0].arrival.ballance, '2').to.be.equal(2);
    });
});
