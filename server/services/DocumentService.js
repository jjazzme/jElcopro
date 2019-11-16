import StateMachine from 'javascript-state-machine';
import _ from 'lodash';
import ModelService from './ModelService';
import db from '../models/index';

const {
    Company, Party, Store,
} = db;

export default class DocumentService extends ModelService {
    /**
     * Transitions used in children
     * @type {Array}
     * @private
     */
    _transitions = [];

    constructor(entity) {
        super(entity);
        this._includes = [
            {
                model: Company,
                as: 'sellerable',
                include: [
                    { model: Store, as: 'stores' },
                    { model: Party, as: 'party' },
                ],
            },
            {
                model: Company,
                as: 'buyerable',
                include: [
                    { model: Store, as: 'stores' },
                    { model: Party, as: 'party' },
                ],
            },
        ];
    }

    /**
     * Transition 'close' for make document 'closed' status
     * Unique for all types of document
     * @param {Object} params
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars
    async _close(params, transaction) {
        if (!this._instance.documentLines.reduce((result, line) => result && line.closed, true)) {
            return Promise.reject(new Error('Some lines for this document is not close!'));
        }
        this._instance.closed = true;
        return true;
    }

    /**
     *  Document status transition
     * @param {string} name - transition name
     * @param {Object=} params
     * @returns {Promise<*>}
     */
    async transition(name, params) {
        let error = new Error('Please set Document instance before using transition');
        if (this._instance) {
            const t = await db.sequelize.transaction();
            StateMachine.apply(this._instance, {
                init: this._instance.status_id,
                transitions: this._transitions,
                methods: { [`onBefore${_.upperFirst(name)}`]: async () => this[`_${name}`](params, t) },
            });
            if (this._instance.can(name)) {
                try {
                    // console.log(`Try ${name} transition`);
                    await this._instance[name]();
                    this._instance.status_id = this._instance.state;
                    await this._instance.save({ transaction: t });
                    await t.commit();
                    return true;
                } catch (e) {
                    // console.error(e);
                    error = e;
                }
            } else {
                error = new Error(`Transition ${name} is impossible for ${this._instance.status_id} status`);
            }
            await t.rollback();
        }
        return Promise.reject(error);
    }
}
