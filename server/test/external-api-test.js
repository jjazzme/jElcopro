import { expect } from 'chai';
import ExternalPriceService from '../services/ExternalPriceService';
import CompanyService from '../services/CompanyService';
import moxios from "moxios";
import fs from "fs";

require('../config/config.js');

describe('ExternalApiService searchByName:', () => {
    let compel, promelec;
    before(async () => {
        moxios.install();
        compel = await fs.readFileSync(__dirname + '/httpAnswers/TDA2003L-TB5-T.json', "utf8");
        promelec = await fs.readFileSync(__dirname + '/httpAnswers/tda2003v.json', "utf8");
        moxios.stubRequest(global.gConfig.companies.compel.api_url, {
            status: 200,
            responseText: compel
        });
        moxios.stubRequest(global.gConfig.companies.promelec.api_url, {
            status: 200,
            responseText: promelec
        });
    });
    after(async () => {
        moxios.uninstall();
    });
    it('Compel search TDA2003L-TB5-T', async () => {
        const compel = await (new CompanyService()).getByAlias('compel');
        const service = await ExternalPriceService.forCompany(compel);
        return service.searchByName('TDA2003L-TB5-T')
            .then((res) => {
                // eslint-disable-next-line no-unused-expressions
                expect(res, 'Response is array').to.be.an('array').that.is.not.empty;
                res.forEach((value) => {
                    expect(value, `Array value is object with property company_id equal ${compel.id}`)
                        .to.be.an('object').with.property('company_id', compel.id);
                });
            });
    });
    it('Promelec search tda2003v', async () => {
        const promelec = await (new CompanyService()).getByAlias('promelec');
        const service = await ExternalPriceService.forCompany(promelec);
        return service.searchByName('tda2003v')
            .then((res) => {
                // eslint-disable-next-line no-unused-expressions
                expect(res, 'Response is array').to.be.an('array').that.is.not.empty;
                res.forEach((value) => {
                    expect(value, `Array value is object with property company_id equal ${promelec.id}`)
                        .to.be.an('object').with.property('company_id', promelec.id);
                });
            });
    });


});
