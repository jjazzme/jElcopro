import DocumentService from './DocumentService';
import DocumentLineService from './DocumentLineService';
import {
    Arrival, DocumentLine, FutureReserve, Good, Order, Product, Reserve,
} from '../models';

export default class OrderService extends DocumentService {
    constructor() {
        super(Order);
        this._transitions = [
            { name: 'toWork', from: 'formed', to: 'in_work' },
            { name: 'unWork', from: 'in_work', to: 'formed' },
            { name: 'close', from: 'in_work', to: 'closed' },
        ];
        this._includes.push({
            model: DocumentLine,
            as: 'documentLines',
        });
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

    /**
     * Transition 'close' for make order 'closed' status
     * @param {Object} params
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars
    async _close(params, transaction) {
        if (!this._instance.documentLines.reduce((result, line) => result && line.closed, true)) {
            return Promise.reject(new Error('Some lines for this document is not close!'));
        }
        this._instance.closed = true;
        return true;
    }
}
