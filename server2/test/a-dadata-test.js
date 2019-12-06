import { expect } from 'chai';
import app from '../index';

describe('Test DadataService', () => {
    const { dadata } = app.services;

    it('Test dadata', async () => {
        const res = await dadata.query('party', 'Москва');
        expect(res, 'Object in answer').to.be.an('object');
        expect(res.suggestions).to.be.an('array').with.length(5);
    });
});
