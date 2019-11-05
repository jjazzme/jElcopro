import { expect } from 'chai';
import ExternalPriceService from '../services/ExternalPriceService';

require('../config/config.js');

describe('ExternalApiService searchByName:', () => {
    it('Compel search tda2003v', async () => {
        const service = await ExternalPriceService.forCompany('compel');
        return service.searchByName('max232cpe')
            .then((res) => {
                // eslint-disable-next-line no-unused-expressions
                expect(res, 'Response is array').to.be.an('array').that.is.not.empty;
            });
    });
    it('Promelec search tda2003v', async () => {
        const service = await ExternalPriceService.forCompany('promelec');
        return service.searchByName('max232cpe')
            .then((res) => {
                // eslint-disable-next-line no-unused-expressions
                expect(res, 'Response is array').to.be.an('array').that.is.not.empty;
            });
    });
});
