import { expect } from 'chai';
import CompelService from '../services/CompelService';
import CompanyService from '../services/CompanyService';

require('../config/config.js');

describe('Compel apiSearchByName:', () => {
    it('search TDA2003L-TB5-T', async () => {
        const compel = await (new CompanyService()).getByAlias('compel');
        const service = new CompelService(compel);
        return service.apiSearchByName('TDA2003L-TB5-T')
            .then((res) => {
                expect(res, 'Response is object').to.be.an('object');
                // eslint-disable-next-line no-unused-expressions
                expect(res, 'Response has property items').to.have.property('items')
                    .to.be.an('array').is.not.empty;
            });
    });
});
