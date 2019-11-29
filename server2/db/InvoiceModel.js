import Document from './DocumentModel';

export default class Invoice extends Document {
    transitions = [
        { name: 'reserve', from: 'formed', to: 'reserved' },
        { name: 'unreserve', from: 'reserved', to: 'formed' },
        { name: 'toWork', from: 'reserved', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'reserved' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    /**
     * Transition 'reserve' try to reserve document lines
     * @param {Object} params
     * @param {boolean} params.own - Reserve only goods that was from our store
     * @param {Transaction} transaction
     * @returns {Promise<unknown>}
     * @private
     */
    async _reserveTransition(params) {
        let reserved = 0;
        // eslint-disable-next-line no-restricted-syntax,no-unused-vars
        for (const line of this._instance.documentLines) {
            // eslint-disable-next-line no-await-in-loop
            reserved += await service.reserve(line, { transaction, own: params ? params.own : false });
        }
        return reserved;
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
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    async _unWork() {
        return true;
    }
}
