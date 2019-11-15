import TransferInService from '../services/TransferInService';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Order arrival', () => {
    let transfer;
    let transferService;
    before(async () => {
        transferService = new TransferInService();
        transfer = await transferService.find({ number_prefix: 'TEST', status_id: 'formed' });
    });
    it('Make first arrival', async () => {
        await transferService.setInstance(transfer);
        const res = await transferService.transition('toWork');
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(transferService.instance.status_id).to.equal('in_work');
    });
    it('Remove first arrival', async () => {
        const res = await transferService.transition('unWork');
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(transferService.instance.status_id).to.equal('formed');
    });
    it('Make first arrival again', async () => {
        const res = await transferService.transition('toWork');
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(transferService.instance.status_id).to.equal('in_work');
    });
});
