import _ from 'lodash';
import DocumentService from './DocumentService';
import db, {
    Document, DocumentLine, Order, TransferIn,
} from '../models';
import DocumentLineService from './DocumentLineService';

export default class OrderService extends DocumentService {
    constructor() {
        super(Order);
        this._transitions = [
            { name: 'toWork', from: 'formed', to: 'in_work' },
            { name: 'unWork', from: 'in_work', to: 'formed' },
            { name: 'close', from: 'in_work', to: 'closed' },
        ];
        this._includes = this._includes.concat(
            { model: DocumentLine, as: 'documentLines' },
            { model: Document, as: 'parent', required: false },
            { model: TransferIn, as: 'children', required: false },
        );
    }

    /**
     * Transition 'toWork' for make order 'in_work' status
     * @param {Object} params
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _toWork(params, transaction) {
        return true;
    }

    /**
     * Transition 'unWork' for make order 'formed' status
     * @param {Object} params
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     * @private
     */

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _unWork(params, transaction) {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    async _close() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('It not close');
        return Promise.reject(new Error('It not close'));
    }

    /**
     * Create child TransferIn with DocumentLines
     * @param {Order} parent
     * @param {Object} child
     * @param {Array|null} parentLines
     * @returns {Promise<Object>}
     */
    async createChild(parent, child, parentLines) {
        const parentLineIds = parentLines ? parentLines.map((line) => (Number.isNaN(line) ? line.id : line)) : null;
        const t = await db.sequelize.transaction();
        let childInsatnce = Object.assign(parent.get({ plain: true }), child);
        childInsatnce.parent_id = parent.id;
        childInsatnce = _.omit(childInsatnce, ['id', 'createdAt', 'updatedAt']);
        try {
            childInsatnce = await this.create(childInsatnce, t);
            const service = new DocumentLineService();
            await service.createChildren(childInsatnce, parentLineIds, t);
            await t.commit();
            return childInsatnce;
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }
}
