import _ from 'lodash';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Corrective', () => {
    const {
        Company, Good, Product, DocumentLine, Movement,
    } = app.services.db.models;
    const { transition } = app.services;
    let elcopro;
    let good;
    // let magazinGood;
    let elcoproMainStore;
    let elcoproMagazin;
    let movement;
    before(async () => {
        elcopro = await Company.getByAlias('elcopro', 'withStores');
        elcoproMainStore = _.find(elcopro.stores, { is_main: true });
        elcoproMagazin = _.find(elcopro.stores, { is_main: false });
        good = await Good.findOne({
            where: { store_id: elcoproMainStore.id },
            include: [{ model: Product, as: 'product', where: { name: 'TEST' } }],
        });
        const newGood = _.omit(
            good.get({ plain: true }),
            ['id', 'ballance', 'createdAt', 'updatedAt'],
        );
        newGood.store_id = elcoproMagazin.id;
        // magazinGood = await Good.findOrCreate({ where: newGood });
    });
    it('Create movement', async () => {
        movement = await Movement.createFromOptics({
            buyerable_id: elcopro.id,
            sellerable_id: elcopro.id,
            number_prefix: 'TEST',
            store_id: elcoproMainStore.id,
            foreighn_store_id: elcoproMagazin.id,
        });
        expect(movement, 'Its Movement').to.be.an.instanceof(Movement).and.deep.include({ status_id: 'formed' });
    });
    it('Create Movement Lines', async () => {
        const line = await good.toMovementDocumentLine(movement, 3);
        expect(line, 'Its DocumentLine').to.be.an.instanceof(DocumentLine).and.deep.include({ closed: false });
    });
    it('Resreve Movement', async () => {
        let res = await transition.execute('reserve', movement);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        res = await transition.execute('toWork', movement);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        res = await transition.execute('closeReserves', movement);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
    });
    it('Create MovementOut', async () => {

    });
});