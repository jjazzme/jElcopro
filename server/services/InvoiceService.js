import DocumentService from './DocumentService';
import DocumentLineService from './DocumentLineService';
import {
    DocumentLine, FutureReserve, Invoice, Reserve,
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
        this._instance = { status_id: 'reserved' };
        this._includes.push({
            model: DocumentLine,
            as: 'documentLines',
            include: [
                { model: FutureReserve, as: 'futureReserve' },
                { model: Reserve, as: 'reserves' },
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
                reserved += await service.reserve(line, { transaction, own: params.own });
            }
            return reserved;
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    async _unreserve() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('It not unreserved');
        return Promise.reject(new Error('It not unreserved'));
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
}
