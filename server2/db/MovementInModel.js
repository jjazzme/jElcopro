import _ from 'lodash';
import TransferIn from './TransferInModel';

export default class MovementIn extends TransferIn {
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
        let child = null;
        if (!optics.parent_id) throw new Error('Need parent');
        await this.services.db.connection.transaction(async () => {
            optics.parent = await MovementOut.getInstance(optics.parent_id, 'withDocumentLines');
            const newMovementIn = _.pick(
                optics.parent.getPlain(),
                ['sellerable_id', 'buyerable_id', 'currency_id'],
            );
            Object.assign(newMovementIn, optics);
            newMovementIn.store_id = optics.parent.foreign_store_id;
            newMovementIn.foreign_store_id = optics.parent.store_id;
            child = await this.create(newMovementIn);
            await DocumentLine.createMovementInLines(child, optics);
        });
        return this.getInstance(child, 'withDocumentLines');
    }
}
