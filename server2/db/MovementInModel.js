import _ from 'lodash';
import Document from './DocumentModel';

export default class MovementIn extends Document {
    transitions = [
        { name: 'toWork', from: 'formed', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'formed' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    /**
     * Create MovementIn from MovementOut with lines
     * @param {Object} optics
     * @returns {Promise<BaseModel|null>}
     */
    static async createFromOptics(optics) {
        const { MovementOut, DocumentLine } = this.services.db.models;
        if (!optics.parent_id) throw new Error('Need parent');
        optics.parent = MovementOut.getInstance(optics.parent_id, 'withDocumentLines');
        const newMovementIn = _.pick(
            optics.parent.getPlain(),
            ['sellerable_id', 'buyerable_id', 'currency_id'],
        );
        newMovementIn.store_id = optics.parent.foreign_store_id;
        newMovementIn.foreign_store_id = optics.parent.store_id;
        const child = await this.create(newMovementIn);
        await DocumentLine.createMovementInLines(child, optics);
        return this.getInstance(child, 'withDocumentLines');
    }
}
