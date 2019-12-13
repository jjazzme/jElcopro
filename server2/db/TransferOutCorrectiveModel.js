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
