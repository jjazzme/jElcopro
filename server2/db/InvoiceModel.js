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
     * @returns {Promise<unknown>}
     * @private
     */
    async _reserveTransition(params) {
        let reserved = 0;
        const lines = await this.getDocumentLines({ scope: ['withFutureReserve'] });
        // eslint-disable-next-line no-restricted-syntax,no-unused-vars
        for (const line of lines) {
            // eslint-disable-next-line no-await-in-loop
            reserved += await line.reserve(params);
        }
        return reserved;
    }

    /**
     * Transition 'unreserve' try to unreserve document lines
     * @param {Object} params
     * @returns {Promise<number>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars
    async _unreserveTransition(params) {
        let unreserved = 0;
        const lines = await this.getDocumentLines({ scope: ['withFutureReserve', 'withReserves'] });
        // eslint-disable-next-line no-restricted-syntax,no-unused-vars
        for (const line of lines) {
            // eslint-disable-next-line no-await-in-loop
            unreserved += await line.unreserve();
        }
        return unreserved;
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
