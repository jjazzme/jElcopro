import _ from 'lodash';
import DocumentService from './DocumentService';
import DocumentLineService from './DocumentLineService';
import db, {
    Arrival, DocumentLine, FutureReserve, Good, Invoice, Product, Reserve,
} from '../models';

export default class InvoiceService extends DocumentService {
    constructor() {
        super(Invoice);
        this._transitions = [
            { name: 'reserve', from: 'formed', to: 'reserved' },
            { name: 'unreserve', from: 'reserved', to: 'formed' },
            { name: 'toWork', from: 'reserved', to: 'in_work' },
            { name: 'unWork', from: 'in_work', to: 'reserved' },
            { name: 'close', from: 'in_work', to: 'closed' },
        ];
        this._includes.push({
            model: DocumentLine,
            as: 'documentLines',
            include: [
                { model: Good, as: 'good', include: [{ model: Product, as: 'product' }] },
                { model: FutureReserve, as: 'futureReserve' },
                { model: Reserve, as: 'reserves', include: [{ model: Arrival, as: 'arrival' }] },
            ],
        });
    }

    /**
     * Transition 'reserve' try to reserve document lines
     * @param {Object} params
     * @param {boolean} params.own - Reserve only goods that was from our store
     * @param {Transaction} transaction
     * @returns {Promise<unknown>}
     * @private
     */
    async _reserve(params, transaction) {
        const service = new DocumentLineService();
        try {
            let reserved = 0;
            // eslint-disable-next-line no-restricted-syntax,no-unused-vars
            for (const line of this._instance.documentLines) {
                // eslint-disable-next-line no-await-in-loop
                reserved += await service.reserve(line, { transaction, own: params ? params.own : false });
            }
            return reserved;
        } catch (e) {
            // console.error(e);
            return Promise.reject(e);
        }
    }

    /**
     * Transition 'unreserve' try to unreserve document lines
     * @param {Object} params
     * @param {Transaction} transaction
     * @returns {Promise<number>}
     * @private
     */
    async _unreserve(params, transaction) {
        const service = new DocumentLineService();
        try {
            let unreserved = 0;
            // eslint-disable-next-line no-restricted-syntax,no-unused-vars
            for (const line of this._instance.documentLines) {
                // eslint-disable-next-line no-await-in-loop
                unreserved += await service.unreserve(line, { transaction });
            }
            return unreserved;
        } catch (e) {
            // console.error(e);
            return Promise.reject(e);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    async _toWork() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('It not toWork');
        return Promise.reject(new Error('It not toWork'));
    }

    // eslint-disable-next-line class-methods-use-this
    async _unWork() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('It not unWork');
        return Promise.reject(new Error('It not unWork'));
    }

    // eslint-disable-next-line class-methods-use-this
    async _close() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('It not close');
        return Promise.reject(new Error('It not close'));
    }

    /**
     * First variant close invoice reserves
     * @param {Object|Invoice|number} invoice
     * @param {Transaction} transaction
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async closeReserves(invoice, transaction) {
        const reserves = await Reserve.findAll({
            where: { closed: false },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: invoice.id } },
            ],
            transaction,
        });
        await Promise.all(reserves.map((reserve) => {
            reserve.closed = true;
            return reserve.save({ transaction });
        }));
    }

    /**
     * Create TransferOut with lines
     * @param parent
     * @param child
     * @returns {Promise<Object>}
     */
    async createChild(parent, child) {
        let childInsatnce = Object.assign(parent.get({ plain: true }), child);
        childInsatnce.parent_id = parent.id;
        childInsatnce = _.omit(childInsatnce, ['id', 'createdAt', 'updatedAt']);
        const t = await db.sequelize.transaction();
        try {
            childInsatnce = await this.create(childInsatnce, t);
            const service = new DocumentLineService();
            await service.createTransferOutLines(childInsatnce, t);
            await t.commit();
            return childInsatnce;
        } catch (e) {
            t.rollback();
            throw e;
        }
    }

    /**
     * First variant open invoice reserves
     * @param {Object|Invoice|number} invoice
     * @param {Transaction} transaction
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async openReserves(invoice, transaction) {
        const reserves = await Reserve.findAll({
            where: { closed: true },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: invoice.id } },
            ],
            transaction,
        });
        await Promise.all(reserves.map((reserve) => {
            reserve.closed = false;
            return reserve.save({ transaction });
        }));
    }
}
