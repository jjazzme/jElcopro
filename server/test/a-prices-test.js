import _ from 'lodash';
import moxios from 'moxios';
import fs from 'fs';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-string'));

const { expect } = chai;

describe('PriceService searchByNameOnStore:', () => {
    let compel; let
        promelec;
    const { Company } = app.services.db.models;
    before(async () => {
        moxios.install();
        compel = await fs.readFileSync(`${__dirname}/httpAnswers/uno_r3.txt`, 'utf8');
        promelec = await fs.readFileSync(`${__dirname}/httpAnswers/prom_uno_r3.json`, 'utf8');
        moxios.stubRequest(app.services.config.companies.compel.api_url, {
            status: 200,
            responseText: compel,
        });
        moxios.stubRequest(app.services.config.companies.promelec.api_url, {
            status: 200,
            responseText: promelec,
        });
    });
    after(async () => {
        moxios.uninstall();
    });
    Object.keys(app.services.config.companies).forEach((alias) => {
        if (alias !== 'elcopro' && alias !== 'rct') {
            it(`Search uno r3 on ${alias}`, async () => {
                const company = await Company.getByAlias(alias, 'withStores');
                const store = _.find(company.stores, { is_main: true });
                return app.services.prices.searchByNameOnStore({ name: 'uno r3', from_store: store })
                    .then((res) => {
                        // eslint-disable-next-line no-unused-expressions
                        expect(res, 'Response is array').to.be.an('array').that.not.empty;
                        res.forEach((value) => {
                            expect(value, `Array value is object with property company_id equal ${company.id}`)
                                .to.be.an('object').with.property('company_id', company.id);
                            expect(value, 'Array value is object with property name contains "uno r3"')
                                .to.be.an('object').with.property('name').that.containIgnoreCase('uno r3');
                            expect(value, 'Array value is object with property multiply contains number')
                                .to.be.an('object').with.property('multiply').that.to.be.an('number');
                        });
                    });
            });
        }
    });
});
