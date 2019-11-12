import OrderService from "../services/OrderService";
import CompanyService from "../services/CompanyService";
import _ from "lodash";
import { TransferIn } from '../models';
import DocumentLineService from "../services/DocumentLineService";
import TransferInService from "../services/TransferInService";

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('TEST Order operations', async () => {
    let child, dan, danStore, elcopro, elcoproStore, lineService, parent, service, transferService;
    before(async () => {
        service = new OrderService();
        lineService = new DocumentLineService();
        transferService = new TransferInService();
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
        const res = await service.transition('toWork');
        expect(res, 'Is true').to.be.true;
        expect(service.instance.status_id).to.equal('in_work');
    });
    it('Create child TransferIn', async () => {
        child = await transferService.createTransferIn({
            parent_id: parent.id,
            number: 1,
            number_prefix: 'TEST',
            user_id: 1
        });
        expect(child, 'Child - formed TransferIn')
            .to.be.an.instanceof(TransferIn).and.deep.include({ status_id: 'formed' });
        await service.transition('unWork'); // need move
    });
    it('Change quantity in Order line  with exeption', async () => {
        let parentLine = _.last(parent.documentLines);
        parentLine.quantity -= 2;
        const error = `${parentLine.quantity} less than possible ${parentLine.quantity + 2}`;
        return expect(lineService.update(parentLine), error)
            .to.be.rejectedWith(Error, error);
    });
    it('Change quantity in TransferIn line  with exeption', async () => {
        let childLine = _.last(child.documentLines);
        childLine.quantity += 2;
        const error = `${childLine.quantity} more than possible ${childLine.quantity - 2}`;
        return expect(lineService.update(childLine), error)
            .to.be.rejectedWith(Error, error);
    });
    it('Change quantity in Order & TransferIn lines', async() => {
        let childLine = _.last(child.documentLines);
        childLine.quantity = 2;
        childLine = await lineService.update(childLine);
        let parentLine = childLine.parent;
        parentLine.quantity += 2;
        parentLine = await lineService.update(parentLine);
        const sum = parentLine.quantity - parentLine.children.reduce((sum, child) => sum + child.quantity, 0);
        expect(sum, 'Difference between Order qauntity & children TransferIn quantities must be 10')
            .to.equal(10);
    });
});