import Document from './DocumentModel';

export default class TransferInCorrective extends Document {
    transitions = [
        { name: 'toWork', from: 'formed', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'formed' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    // eslint-disable-next-line no-unused-vars
    async _toWorkTransition(params) {
        const { Arrival } = this.services.db.models;
        const documentLines = await this.getDocumentLines();
        // eslint-disable-next-line no-unused-vars
        for (const line of documentLines) {
            await Arrival.create({ document_line_id: line.id, ballance: line.quantity });
            await line.update({ closed: true });
        }
        return true;
    }

    // eslint-disable-next-line no-unused-vars
    async _unWorkTransition(params) {
        await this.parentToBeOpen();
        const documentLines = await this.getDocumentLines({ scope: ['withArrival'] });
        return Promise.all(documentLines.map((line) => line.arrival.destroy()));
    }

    /**
     * Create
     * @param {Object} optics
     * @returns {Promise<BaseModel|null>}
     */
    static async createFromOptics(optics) {
        if (!optics.parentLines) throw new Error('Need select some parent lines');
        const { TransferOut } = this.services.db.models;
        return this.createFromParent(TransferOut, 'createTransferCorrectiveLines', optics);
    }
}
