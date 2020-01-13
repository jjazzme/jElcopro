import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Invoice', () => {
    const {
        TransferOutCorrective, Reserve, Departure,
    } = app.services.db.models;
    const { transition } = app.services;
    let transferOutCorrective;
    before(async () => {
        transferOutCorrective = await TransferOutCorrective.findOne();
    });
    it('Test TransferOutCorrective unsreserve', async () => {
        const res = await transition.execute('unreserve', transferOutCorrective);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(transferOutCorrective.status_id).to.equal('formed');
        const resereves = await Reserve.findAll();
        expect(resereves.length, '3').to.be.equal(3);
        resereves.forEach((reserve) => {
            expect(reserve.quantity, '1').to.be.equal(1);
        });
    });
    it('Update and reserve TransferOutCorrective again', async () => {
        const documentLines = await transferOutCorrective.getDocumentLines({ scope: ['withGood'] });
        await documentLines[0].update({ quantity: 3 });
        await transition.execute('reserve', transferOutCorrective);
        expect(transferOutCorrective.status_id).to.equal('reserved');
        const { good } = documentLines[0];
        await good.reload();
        expect(good.ballance, '4').to.be.equal(4);
    });
    it('Test toWork for TransferOutCorrective', async () => {
        const res = await transition.execute('toWork', transferOutCorrective);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        const departures = await Departure.findAll();
        expect(departures.length, '2').to.be.equal(2);
    });
});
