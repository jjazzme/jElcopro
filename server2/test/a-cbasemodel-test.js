import { expect } from 'chai';
import app from '../index';

describe('Test DadataService', () => {
    const { Producer } = app.services.db.models;

    it('Test BaseModel on Producer', async () => {
        let p = await Producer.getModel(1);
        expect(p, 'Is Product with id 1').to.be.an.instanceof(Producer).and.deep.include({ id: 1 });
        p = await Producer.getModel(p, ['rightProducer']);
        expect(p, 'Is Product with id 1').to.be.an.instanceof(Producer)
            .and.deep.include({ id: 1 })
            .and.has.property('rightProducer');
        p = await Producer.getModel({ id: 2 });
        expect(p, 'Is Product with id 2').to.be.an.instanceof(Producer).and.deep.include({ id: 2 });
        p = await Producer.getModel({ name: 'MAX' }, ['rightProducer']);
        expect(p, 'Is Product with name MAX').to.be.an.instanceof(Producer)
            .and.deep.include({ name: 'MAX' })
            .and.has.property('rightProducer');
    });
});
