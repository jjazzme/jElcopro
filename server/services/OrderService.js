import DocumentService from './DocumentService';
import {
    Document, DocumentLine, Order, TransferIn,
} from '../models';

export default class OrderService extends DocumentService {
    constructor() {
        super(Order);
        this._transitions = [
            { name: 'toWork', from: 'formed', to: 'in_work' },
            { name: 'unWork', from: 'in_work', to: 'formed' },
            { name: 'close', from: 'in_work', to: 'closed' },
        ];
        this._includes = this._includes.concat(
            { model: DocumentLine, as: 'documentLines' },
            { model: Document, as: 'parent', required: false },
            { model: TransferIn, as: 'children', required: false },
        );
    }

    /**
     * Transition 'toWork' for make order 'in_work' status
     * @param {Object} params
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _toWork(params, transaction) {
        return true;
    }

    /**
     * Transition 'unWork' for make order 'formed' status
     * @param {Object} params
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     * @private
     */

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _unWork(params, transaction) {
        return true;
    }
}
