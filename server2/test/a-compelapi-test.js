import moxios from 'moxios';
import fs from 'fs';
import { expect } from 'chai';
import app from '../index';

describe('Compel apiSearchByName:', () => {
    let comp;
    const { compel } = app.services;
    before(async () => {
        moxios.install();
        comp = await fs.readFileSync(`${__dirname}/httpAnswers/TDA2003L-TB5-T.json`, 'utf8');
        moxios.stubRequest(app.services.config.companies.compel.api_url, {
            status: 200,
            responseText: comp,
        });
    });
    after(async () => {
        moxios.uninstall();
    });
    it('search TDA2003L-TB5-T', async () => compel.apiSearchByName('TDA2003L-TB5-T')
        .then((res) => {
            expect(res, 'Response is object').to.be.an('object');
            // eslint-disable-next-line no-unused-expressions
            expect(res, 'Response has property items').to.have.property('items')
                .to.be.an('array').is.not.empty;
        }));
});
