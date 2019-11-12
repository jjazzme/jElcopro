import DocumentService from './DocumentService';
import db from '../models';
import OrderService from './OrderService';
import ArrivalService from './ArrivalService';

const {
    Document, DocumentLine, Order, TransferIn,
} = db;

export default class TransferInService extends DocumentService {
    constructor() {
        super(TransferIn);
        this._transitions = [
            { name: 'toWork', from: 'formed', to: 'in_work' },
            { name: 'unWork', from: 'in_work', to: 'formed' },
            { name: 'close', from: 'in_work', to: 'closed' },
        ];
        this._includes = this._includes.concat(
            { model: DocumentLine, as: 'documentLines' },
            { model: Order, as: 'parent', required: false },
            { model: Document, as: 'children', required: false },
        );
    }

    /**
     * Transition 'toWork' for make TransferIn 'in_work' status
     * and make arrivals
     * @param {Object} params
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     * @private
     */
    async _toWork(params, transaction) {
        const service = new ArrivalService();
        // eslint-disable-next-line no-unused-vars
        for (const line of this._instance.documentLines) {
            await service.create({
                document_line_id: line.id,
                ballance: line.quantity,
            }, transaction);
            line.closed = true;
            await line.save({ transaction });
            const parent = await (new OrderService()).getModel(line.parent, transaction);
            const quantity = parent.documentLines.reduce((sum, l) => sum + l.quantity, 0);
            const closed = parent.documentLines.reduce((cls, l) => cls && l.closed, true);
            parent.closed = closed && parent.quantity === quantity;
            await parent.save({ transaction });
        }
        return true;
    }

    /**
     * Transition 'unWork' for make TransferIn 'formed' status
     * and remove arrivals
     * @param {Object} params
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     * @private
     */
    async _unWork(params, transaction) {
        if (this._instance.parent.closed) throw new Error('Open parent Order before');
        const service = new ArrivalService();
        // eslint-disable-next-line no-unused-vars
        for (const line of this._instance.documentLines) {
            const arrival = await service.find({ document_line_id: line.id }, transaction);
            await service.destroy(arrival, transaction);
            line.closed = false;
            await line.save({ transaction });
            const parent = await (new OrderService()).getModel(line.parent, transaction);
            parent.closed = false;
            await parent.save({ transaction });
        }
        return true;
    }

    /**
     * Create child TransferIn for Order
     * @param optics - TODO need write properties
     * @returns {Promise<Object>}
     */
    async createTransferIn(optics) {
        const parent = await (new OrderService()).find({ id: optics.parent_id });
        const child = await this.createChild(
            parent,
            {
                document_type_id: 'transfer-in',
                number: optics.number,
                number_prefix: optics.number_prefix,
                user_id: optics.user_id,
                status_id: 'formed',
            },
            optics.lines,
        );
        try {
            return await this.find({ id: child.id });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}
