import _ from 'lodash';
import Document from './DocumentModel';

export default class TransferOutCorrective extends Document {
    transitions = [
        { name: 'reserve', from: 'formed', to: 'reserved' },
        { name: 'unreserve', from: 'reserved', to: 'formed' },
        { name: 'toWork', from: 'reserved', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'reserved' },
        { name: 'closeReserves', from: 'in_work', to: 'in_work' },
        { name: 'openReserves', from: 'in_work', to: 'in_work' },
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

    /**
     * Create
     * @param optics
     * @returns {Promise<BaseModel|null>}
     */
    static async createFromOptics(optics) {
        let child = null;
        const { TransferIn, DocumentLine } = this.services.db.models;
        if (!optics.parent_id) throw new Error('Need parent');
        if (!optics.parentLines) throw new Error('Need select some parent lines');
        await this.services.db.connection.transaction(async () => {
            const parent = await TransferIn.getInstance(optics.parent_id);
            const newOptics = _.pick(
                parent.getPlain(),
                ['sellerable_id', 'buyerable_id', 'store_id', 'foreign_store_id', 'currency_id'],
            );
            Object.assign(newOptics, optics);
            child = await super.createFromOptics(newOptics);
            await DocumentLine.createTransferInLines(child, optics); // Use because the same logic
        });
        return this.getInstance(child, 'withDocumentLines');
    }
}
