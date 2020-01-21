import _ from 'lodash';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Corrective', () => {
    const {
        Undefective, Company, Good, Product, DocumentLine, Arrival,
    } = app.services.db.models;
    const { transition } = app.services;
    let elcopro;
    let good;
    let undefective;
    before(async () => {
        elcopro = await Company.getByAlias('elcopro', 'withStores');
        const elcoproStore = _.find(elcopro.stores, { is_main: true });
        good = await Good.findOne({
            where: { store_id: elcoproStore.id },
            include: [{ model: Product, as: 'product', where: { name: 'TEST' } }],
        });
    });
    it('Create undefective', async () => {
        undefective = await Undefective.createFromOptics({ buyerable_id: elcopro.id, number_prefix: 'TEST' });
        expect(undefective, 'Undefective').to.be.an.instanceof(Undefective).and.deep.include({ status_id: 'formed' });
    });
    it('Create line', async () => {
        const line = await good.reestablish(undefective, 2);
        expect(line, 'Document line').to.be.an.instanceof(DocumentLine)
            .and.deep.include(
                {
                    good_id: good.id, from_good_id: good.id, quantity: 2, closed: false,
                },
            );
    });
    it('Udefectife transitions', async () => {
        const res = await transition.execute('toWork', undefective);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        const line = _.first(await undefective.getDocumentLines({ scope: ['withArrival'] }));
        expect(line.arrival, 'Arrival').to.be.an.instanceof(Arrival).and.deep.include({ ballance: 2 });
    });
});
