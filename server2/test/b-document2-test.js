import _ from 'lodash';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('TEST Order operations', () => {
    let child; let dan; let danStore; let elcopro; let elcoproStore; let parent;
    const { Company, Order, TransferIn } = app.services.db.models;
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
        }, 'withDocumentLines');
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
    it('Create child TransferIn', async () => {
        child = await TransferIn.createFromOptics({ parent_id: parent.id, number_prefix: 'TEST' });
        expect(child, 'Child - formed TransferIn')
            .to.be.an.instanceof(TransferIn).and.deep.include({ status_id: 'formed' });
    });
    it('Change quantity in Order line  with exeption', async () => {
        const parentLine = _.last(parent.documentLines);
        parentLine.quantity -= 2;
        const error = `${parentLine.quantity} less than possible ${parentLine.quantity + 2}`;
        return expect(parentLine.save(), error)
            .to.be.rejectedWith(Error, error);
    });
    it('Change quantity in TransferIn line  with exeption', async () => {
        const childLine = _.last(child.documentLines);
        childLine.quantity += 2;
        const error = `${childLine.quantity} more than possible ${childLine.quantity - 2}`;
        return expect(childLine.save(), error)
            .to.be.rejectedWith(Error, error);
    });
    it('Change quantity in Order & TransferIn lines', async () => {
        const childLine = _.last(child.documentLines);
        childLine.quantity = 2;
        await childLine.save();
        const parentLine = childLine.parent;
        parentLine.quantity += 2;
        await parentLine.save();
        parentLine.children = await parentLine.getChildren();
        const sum = parentLine.quantity - parentLine.children.reduce((s, c) => s + c.quantity, 0);
        expect(sum, 'Difference between Order qauntity & children TransferIn quantities must be 10')
            .to.equal(10);
    });
});
