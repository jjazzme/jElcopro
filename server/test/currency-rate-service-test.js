import moment from 'moment';
import moxios from 'moxios';
import fs from 'fs';
import CurrencyRateService from '../services/CurrencyRateService';

const chai = require('chai');
// chai.use(require('chai-string'));

const { expect } = chai;

require('../config/config.js');

describe('CurrencyRateService - getRatesByDate:', () => {
    before(() => {
        moxios.install();
    });
    after(() => {
        moxios.uninstall();
    });
    const start = new Date('2010-01-01');
    const end = new Date('2012-01-01');
    let date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const formatDate = moment(date).format('YYYY-MM-DD');
    date = new Date(formatDate);
    it(`Get currency rates by ${formatDate}`, async () => {
        const xml = fs.readFileSync(__dirname + '/httpAnswers/currency.xml');
        moxios.stubRequest(`http://www.cbr.ru/scripts/XML_daily.asp?date_req=${moment(date).format('DD.MM.YYYY')}`, {
            status: 200,
            responseText: xml
        });
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
