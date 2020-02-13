import { expect } from 'chai';
import app from '../index';

describe('Test CompanyModel', () => {
    const { Company } = app.services.db.models;

    it('Test rct alias', async () => {
        const c = await Company.getByAlias('rct');
        expect(c, 'Company with inn Party 7714382510').to.be.an('object')
            .and.have.deep.nested.property('party.inn', '7714382510');
        expect(c, 'Company has property stores').to.have.property('stores');
    });
});
