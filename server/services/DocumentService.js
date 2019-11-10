import StateMachine from 'javascript-state-machine';
import _ from 'lodash';
import Entity from './Entity';
import db from '../models/index';
import DocumentLineService from "./DocumentLineService";

const {
    Company, Document, DocumentLine, Party, Store,
} = db;

export default class DocumentService extends Entity {
    /**
     * Transitions used in children
     * @type {Array}
     * @private
     */
    _transitions = [];

    constructor(entity) {
        super(entity);
        this._includes = [
            { model: Document, as: 'parent' },
            { model: Document, as: 'children' },
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
                    console.log(`Try ${name} transition`);
                    await this._instance[name]();
                    this._instance.status_id = this._instance.state;
                    await this._instance.save({ transaction: t });
                    await t.commit();
                    return true;
                } catch (e) {
                    console.error(e);
                    error = e;
                }
            } else {
                error = new Error(`Transition ${name} is impossible for ${this._instance.status_id} status`);
            }
            await t.rollback();
        }
        return Promise.reject(error);
    }

    /**
     * Create child Document with DocumentLines
     * @param parent
     * @param child
     * @param parentLines
     * @returns {Promise<Object>}
     */
    async createChild(parent, child, parentLines) {
        const parentInstance = await this.getInstance(parent);
        const parentLineIds = parentLines.map((line) => isNaN(line) ? line.id : line );
        const t = await db.sequelize.transaction();
        let childInsatnce = Object.assign(parentInstance.get({ plain: true }), child);
        try {
            childInsatnce = await this.create(childInsatnce, t);
            await (new DocumentLineService()).createChildren(childInsatnce, parentLineIds, t);
            childInsatnce.document_lines =
                await DocumentLine.findAll({ where: { document_id: childInsatnce.id }, transaction: t });
            t.commit();
            return childInsatnce;
        } catch (e) {
            console.error(e);
            t.rollback();
            throw e;
        }
    }
}
