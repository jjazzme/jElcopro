import ProducerService from "../services/ProducerService";
import db from "../models";
const { Producer } = db;

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

require('../config/config.js');

describe('Entity(Producer) without transaction:', () => {
    const service = new ProducerService();
    let producer;
    it('Create Producer TESTPRODUCER', async () => {
        return service.create({ name: 'TESTPRODUCER' }).then((res) => {
            producer = res;
            expect(producer, 'It Producer with name TESTPRODUCER')
                .to.be.an.instanceof(Producer).and.deep.include({ name: 'TESTPRODUCER' });
        });
    });
    it('Try Create Producer TESTPRODUCER again with exeption', async () => {
        return expect(service.create({ name: 'TESTPRODUCER' }), '123')
            .to.be.rejectedWith(db.Sequelize.UniqueConstraintError, "Validation error")
    });
    it('Update Producer TESTPRODUCER', async () => {
        producer.site = 'www.site.ru';
        return service.update(producer).then((res) => {
            expect(res, 'Producer with name TESTPRODUCER & site www.site.ru')
                .to.be.an.instanceof(Producer).and.deep.include({
                    name: 'TESTPRODUCER',
                    site: 'www.site.ru'
                });
        });
    });
    it('Delete TESTPRODUCER', async () => {
        await service.destroy(producer);
        return service.find({ name: 'TESTPRODUCER' })
            .then((res) => {
                expect(res, 'Producer was delete by').to.be.null;
            })
    });
});