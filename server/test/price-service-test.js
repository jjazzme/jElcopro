import _ from 'lodash';
import CompanyService from '../services/CompanyService';
import PriceService from '../services/PriceService';

const chai = require('chai');
chai.use(require('chai-string'));

const { expect } = chai;

require('../config/config.js');

describe('PriceService searchByNameOnStore:', () => {
    Object.keys(global.gConfig.companies).forEach((alias) => {
        if (alias !== 'elcopro') {
            it(`Search uno r3 on ${alias}`, async () => {
                const company = await (new CompanyService()).getByAlias(alias);
                const store = _.find(company.stores, { is_main: true });
                const service = new PriceService();
                return service.searchByNameOnStore({ name: 'uno r3', from_store: store })
                    .then((res) => {
                        // eslint-disable-next-line no-unused-expressions
                        expect(res, 'Response is array').to.be.an('array').that.not.empty;
                        res.forEach((value) => {
                            expect(value, `Array value is object with property company_id equal ${company.id}`)
                                .to.be.an('object').with.property('company_id', company.id);
                            expect(value, 'Array value is object with property name contains "uno r3"')
                                .to.be.an('object').with.property('name').that.containIgnoreCase('uno r3');
                        });
                    });
            });
        }
    });
});
