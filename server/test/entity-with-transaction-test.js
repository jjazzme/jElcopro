import ProducerService from "../services/ProducerService";
import db from "../models";
const { Producer } = db;

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

require('../config/config.js');

describe('Entity(Producer) with transaction:',  () => {
    const service = new ProducerService();
    let producer;
    let t;
    before(async () => {
        t = await db.sequelize.transaction();
    });
    after(async () => {
        await t.commit();
    });
    it('Create Producer TESTPRODUCER_T', async () => {
        producer = await service.create({name: 'TESTPRODUCER_T'}, t);
        expect(producer, 'It Producer with name TESTPRODUCER_T')
            .to.be.an.instanceof(Producer).and.deep.include({name: 'TESTPRODUCER_T'});
    });
    it('Find Producer TESTPRODUCER_T with exeption', async () => {
        const p = await service.find({name: 'TESTPRODUCER_T'});
        expect(p, 'Producer was null').to.be.null;
    });
    it('Find Producer TESTPRODUCER_T with transaction', async () => {
        const p = await service.find({name: 'TESTPRODUCER_T'}, t);
        expect(p, 'It Producer with name TESTPRODUCER_T')
            .to.be.an.instanceof(Producer).and.deep.include({name: 'TESTPRODUCER_T'});
    });
    it('Update Producer TESTPRODUCER_T with transaction', async () => {
        producer.site = 'www.site.ru';
        producer = await service.update(producer, t);
        expect(producer, 'Producer with name TESTPRODUCER_T & site www.site.ru')
            .to.be.an.instanceof(Producer).and.deep.include({
                name: 'TESTPRODUCER_T',
                site: 'www.site.ru'
            });
    });
    it('Delete TESTPRODUCER_T with transaction', async () => {
        await service.destroy(producer, t);
        const p = await service.find({name: 'TESTPRODUCER_T'});
        expect(p, 'Producer was null').to.be.null;
    });
});