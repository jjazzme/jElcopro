import moment from 'moment';
import CurrencyRateService from '../services/CurrencyRateService';

const chai = require('chai');
// chai.use(require('chai-string'));

const { expect } = chai;

require('../config/config.js');

describe('CurrencyRateService - getRatesByDate:', () => {
    const start = new Date('2010-01-01');
    const end = new Date('2020-01-01');
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const formatDate = moment(date).format('YYYY-MM-DD');
    it(`Get currency rates by ${formatDate}`, async () => {
        const service = new CurrencyRateService();
        return service.getRatesByDate(date).then((rates) => {
            // eslint-disable-next-line no-unused-expressions
            expect(rates, 'Result is array not empty').to.be.an('array').that.is.not.empty;
            rates.forEach((rate) => {
                expect(rate, `Rate is object with property date equal ${formatDate}`)
                    .to.be.an('object').with.property('date').that.equal(formatDate);
            });
        });
    });
});
