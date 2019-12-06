import _ from 'lodash';
import Document from './DocumentModel';

export default class TransferOut extends Document {
    transitions = [
        { name: 'toWork', from: 'formed', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'formed' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    /**
     * Transition 'toWork' for make TransferOut 'in_work' status
     * and make arrivals
     * @param {Object} params
     * @returns {Promise<boolean>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars
    async _toWorkTransition(params) {
        this.documentLines = this.documentLines || await this.getDocumentLines();
        // eslint-disable-next-line no-unused-vars
        for (const line of this.documentLines) {
            await line.update({ closed: true });
            const parent = await line.getParent({ scope: ['withChildren'] });
            const quantity = parent.children.reduce((sum, l) => sum + l.quantity, 0);
            const closed = parent.children.reduce((cls, l) => cls && l.closed, true);
            await parent.update({ closed: closed && parent.quantity === quantity });
        }
        return true;
    }

    /**
     * Transition 'unWork' for make TransferOut 'formed' status
     * and remove arrivals
     * @param {Object} params
     * @returns {Promise<boolean>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars
    async _unWorkTransition(params) {
        this.parent = this.parnet || await this.getParent();
        if (this.parent.closed) throw new Error('Open parent Order before');
        this.documentLines = this.documentLines || await this.getDocumentLines();
        // eslint-disable-next-line no-unused-vars
        for (const line of this.documentLines) {
            await line.update({ closed: false });
            const parent = await line.getParent();
            await parent.update({ closed: false });
        }
        return true;
    }

    /**
     * Create TransferIn from Order with lines
     * @param optics
     * @returns {Promise<BaseModel|null>}
     */
    static async createFromOptics(optics) {
        let child = null;
        const { Invoice, DocumentLine } = this.services.db.models;
        if (!optics.parent_id) throw new Error('Need parent');
        await this.services.db.connection.transaction(async () => {
            const parent = await Invoice.getInstance(optics.parent_id);
            const newOptics = _.pick(
                parent.getPlain(),
                ['sellerable_id', 'buyerable_id', 'store_id', 'foreign_store_id', 'currency_id'],
            );
            Object.assign(newOptics, optics);
            child = await super.createFromOptics(newOptics);
            await DocumentLine.createTransferOutLines(child, optics);
        });
        return this.getInstance(child, 'withDocumentLines');
    }
}
