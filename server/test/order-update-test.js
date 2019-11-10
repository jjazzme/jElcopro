import OrderService from "../services/OrderService";
import CompanyService from "../services/CompanyService";
import _ from "lodash";

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('TEST Order operations', async () => {
    let dan, danStore, elcopro, elcoproStore, parent, service;
    before(async () => {
        service = new OrderService();
        dan = await (new CompanyService()).getByAlias('dan');
        danStore = _.find(dan.stores, { is_main: true });
        elcopro = await (new CompanyService()).getByAlias('elcopro');
        elcoproStore = _.find(elcopro.stores, { is_main: true });
        parent = await service.find({
            number: '1',
            user_id: 1,
            sellerable_id: dan.id,
            buyerable_id: elcopro.id,
            store_id: elcoproStore.id,
            foreign_store_id: danStore.id,
            number_prefix: 'TEST',
        });
        await service.setInstance(parent);
    });
    after(async () => {

    });
    it('Order transition "unWork" with exeption ', async () => {
        return expect(service.transition('unWork'), 'Transition unWork is impossible for formed status')
            .to.be.rejectedWith(Error, "Transition unWork is impossible for formed status");
    });
    it('Order transition "toWork"', async () => {

    });
});