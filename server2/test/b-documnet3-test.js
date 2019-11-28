import _ from 'lodash';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Order arrival', () => {
    let transfer;
    const { transition } = app.services;
    const { TransferIn } = app.services.db.models;
    before(async () => {
        transfer = await TransferIn.getInstance({ number_prefix: 'TEST', status_id: 'formed' });
    });
    it('Make first arrival', async () => {
        const res = await transition.execute('toWork', transfer);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(transfer.status_id).to.equal('in_work');
    });
    /* it('Remove first arrival', async () => {
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
    }); */
});
