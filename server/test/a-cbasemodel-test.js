import { expect } from 'chai';
import app from '../index';

describe('Test DadataService', () => {
    const { User, Producer } = app.services.db.models;

    it('Test BaseModel on Producer', async () => {
        let p = await Producer.getInstance(1);
        expect(p, 'Is Product with id 1').to.be.an.instanceof(Producer).and.deep.include({ id: 1 });
        p = await Producer.getInstance(p, ['rightProducer']);
        expect(p, 'Is Product with id 1').to.be.an.instanceof(Producer)
            .and.deep.include({ id: 1 })
            .and.has.property('rightProducer');
        p = await Producer.getInstance({ id: 2 });
        expect(p, 'Is Product with id 2').to.be.an.instanceof(Producer).and.deep.include({ id: 2 });
        p = await Producer.getInstance({ name: 'MAX' }, 'rightProducer');
        expect(p, 'Is Product with name MAX').to.be.an.instanceof(Producer)
            .and.deep.include({ name: 'MAX' })
            .and.has.property('rightProducer');
        // eslint-disable-next-line no-unused-expressions
        expect(await User.getInstance('Test'), 'Has not getByAlias').is.null;
        p = await Producer.getInstance('MAX');
        expect(p, 'Is Product with name MAX').to.be.an.instanceof(Producer).and.deep.include({ name: 'MAX' });
    });
});
