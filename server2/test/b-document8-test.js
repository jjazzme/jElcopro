import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Corrective', () => {
    const {
        Defective, Company, Good, Product,
    } = app.services.db.models;
    const { transition } = app.services;
    let elcopro;
    let good;
    before(async () => {
        elcopro = await Company.getByAlias('elcopro', 'withStores');
        good = await Good.findOne({ include: [{ model: Product, as: 'product', where: { name: 'TEST' } }] });
    });
    it('Create Defective', async () => {
        const d = await Defective.createFromOptics({
            sellerable_id: elcopro.id,
            number_prefix: 'TEST',
        });
        expect(d, 'Defective').to.be.an.instanceof(Defective).and.deep.include({ status_id: 'formed' });
    });
    it('Create Defective line', async () => {
        const d = await Defective.getInstance({ number_prefix: 'TEST' });
        const lines = await good.discard(d, 3);
        expect(lines.length, '1').to.be.equal(1);
    });
    it('ToWork Defective', async () => {
        const d = await Defective.getInstance({ number_prefix: 'TEST' });
        const res = await transition.execute('toWork', d);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        const lines = await d.getDocumentLines({ scope: ['withDeparture'] });
        const arrival = await lines[0].departure.getArrival();
        expect(arrival.ballance, '1').to.be.equal(1);
    });
    it('Second Defective with exeption', async () => {
        const d = await Defective.createFromOptics({
            sellerable_id: elcopro.id,
            number_prefix: 'TEST',
        });
        const error = 'Not need quantity';
        return expect(good.discard(d, 5), error).to.be.rejectedWith(Error, error);
    });
    it('Second defective', async () => {
        const d = await Defective.getInstance({ number_prefix: 'TEST', number: 2 });
        let lines = await good.discard(d, 4);
        expect(lines.length, '3').to.be.equal(3);
        let res = await transition.execute('toWork', d);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        res = await transition.execute('unWork', d);
        // eslint-disable-next-line no-unused-expressions
        expect(res, 'Is true').to.be.true;
        lines = await d.getDocumentLines();
        expect(lines.length, '2').to.be.equal(2);
    });
});
