import _ from 'lodash';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('TEST Order operations', () => {
    let child; let dan; let danStore; let elcopro; let elcoproStore; let parent;
    const { Company, Order } = app.services.db.models;
    const { transition } = app.services;
    before(async () => {
        dan = await Company.getByAlias('dan');
        danStore = _.find(dan.stores, { is_main: true });
        elcopro = await Company.getByAlias('elcopro');
        elcoproStore = _.find(elcopro.stores, { is_main: true });
        parent = await Order.getInstance({
            number: '1',
            user_id: 1,
            sellerable_id: dan.id,
            buyerable_id: elcopro.id,
            store_id: elcoproStore.id,
            foreign_store_id: danStore.id,
            number_prefix: 'TEST',
        });
    });
    it('Order transition "unWork" with exeption ', async () => expect(
        transition.execute('unWork', parent), 'Transition unWork is impossible for formed status',
    ).to.be.rejectedWith(Error, `${parent} transition unWork is impossible for formed status`));
    it('Order transition "toWork"', async () => {
        const res = await transition.execute('toWork', parent);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        expect(parent.status_id).to.equal('in_work');
    });
});
