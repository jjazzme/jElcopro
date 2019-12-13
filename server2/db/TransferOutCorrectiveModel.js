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
     * @param {Object} optics
     * @returns {Promise<BaseModel|null>}
     */
    static async createFromOptics(optics) {
        if (!optics.parentLines) throw new Error('Need select some parent lines');
        const { TransferIn } = this.services.db.models;
        return this.createFromParent(TransferIn, 'createTransferInLines', optics);
    }
}
