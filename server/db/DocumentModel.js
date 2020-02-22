import _ from 'lodash';
import Sequelize from 'sequelize';
import BaseModel from './BaseModel';

const { Op } = Sequelize;

export default class Document extends BaseModel {
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
        const { FutureReserve } = this.services.db.models;
        let unreserved = 0;
        const lines = await this.getDocumentLines({ scope: ['withFutureReserve', 'withReserves'] });
        const futureReserves = lines.map((line) => (line.futureReserve ? line.futureReserve.id : 0));
        await FutureReserve.destroy({ where: { id: { [Op.in]: futureReserves } } });
        // eslint-disable-next-line no-restricted-syntax,no-unused-vars
        for (const line of lines) {
            // eslint-disable-next-line no-await-in-loop
            unreserved += await line.unreserve();
        }
        return unreserved;
    }

    /**
     * Transition 'toWork' for make order 'in_work' status
     * @param {Object} params
     * @returns {Promise<boolean>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _toWorkTransition(params) {
        return true;
    }

    /**
     * Transition 'unWork' for make order 'formed' status
     * @param {Object} params
     * @returns {Promise<boolean>}
     * @private
     */

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _unWorkTransition(params) {
        await this.parentToBeOpen();
        return true;
    }

    /**
     * First variant close invoice reserves
     * @returns {Promise<void>}
     */
    async _closeReservesTransition() {
        const { DocumentLine, Reserve } = this.services.db.models;
        const reserves = await Reserve.findAll({
            where: { closed: false },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: this.id } },
            ],
        });
        await Promise.all(reserves.map((reserve) => reserve.update({ closed: true })));
        return true;
    }

    /**
     * First variant open invoice reserves
     * @returns {Promise<void>}
     */
    async _openReservesTransition() {
        const { DocumentLine, Reserve } = this.services.db.models;
        const reserves = await Reserve.findAll({
            where: { closed: true },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: this.id } },
            ],
        });
        await Promise.all(reserves.map((reserve) => reserve.update({ closed: false })));
        return true;
    }

    /**
     * Close
     * @returns {Promise<boolean>}
     * @private
     */
    async _closeTransition() {
        this.documentLines = this.documentLines || await this.getDocumentLines();
        if (!this.documentLines.reduce((result, line) => result && line.closed, true)) {
            throw new Error('Some lines for this document is not close!');
        }
        this.closed = true;
        return true;
    }

    async parentToBeOpen() {
        this.parent = this.parent || await this.getParent();
        if (this.parent?.closed) throw new Error('Open parent before');
    }

    /**
     * Create single Document
     * @param {Object} optics
     * @returns {Promise<Document>}
     */
    static async createFromOptics(optics) {
        const newInstance = _.pick(optics, _.keys(this.tableAttributes));
        return this.create(newInstance);
    }

    /**
     * Create Document from Parent with Lines
     * @param {Document} ParentModel
     * @param {string} documentLinesMethod
     * @param {Object} optics
     * @returns {Promise<BaseModel|null>}
     */
    static async createFromParent(ParentModel, documentLinesMethod, optics) {
        let child = null;
        const { DocumentLine } = this.services.db.models;
        if (!optics.parent_id) throw new Error('Need parent');
        await this.services.db.connection.transaction(async () => {
            const parent = await ParentModel.getInstance(optics.parent_id);
            const newOptics = _.pick(
                parent.getPlain(),
                ['sellerable_id', 'buyerable_id', 'store_id', 'foreign_store_id', 'currency_id'],
            );
            Object.assign(newOptics, optics);
            const newInstance = _.pick(newOptics, _.keys(this.tableAttributes));
            child = await this.create(newInstance);
            await DocumentLine[documentLinesMethod](child, optics);
        });
        return this.getInstance(child, 'withDocumentLines');
    }


    static registerHooks() {
        /**
         * Before Create new DocumentLine resolve dependencies on right Good & Store
         */
        this.beforeCreate(async (doc, options) => {
            const user = options.request ? options.request.user : options.user;
            if (!user) throw new Error('Need User');
            doc.set({ user_id: user.id });
            if (!doc.store_id) await doc.fillStore();
            if (!doc.get('foreign_store_id')) await doc.fillFromStore();
            if (!_.isNumber(doc.number)) doc.number = await this.nextNumber(doc.number_prefix);
        });

        this.beforeUpdate((doc) => {
            const changes = doc.changed();
            if (changes && !changes.includes('status_id') && doc.status_id !== 'formed') {
                throw new Error('Document must be in formed status');
            }
        });

        this.beforeDestroy((doc, options) => {
            if (doc.status_id !== 'formed') throw new Error('Document must be in formed status');
            const user = options.request ? options.request.user : options.user;
            if (!user) throw new Error('Need User');
            if (user.cards.invoice === doc.id || user.cards.orders.indexOf(doc.id) >= 0) {
                throw new Error('Document in your cards');
            }
        });
    }

    async fillStore() {
        const { Company } = this.services.db.models;
        const companyId = ['order', 'transfer-in'].indexOf(this.document_type_id) >= 0
            ? this.buyerable_id : this.sellerable_id;
        const company = await Company.getInstance(companyId, 'withStores');
        const store = _.find(company.stores, { is_main: true });
        this.store_id = store.id;
    }

    async fillFromStore() {
        const { Company } = this.services.db.models;
        const companyId = ['order', 'transfer-in'].indexOf(this.document_type_id) >= 0
            ? this.sellerable_id : this.buyerable_id;
        const company = await Company.getInstance(companyId, 'withStores');
        const fromStore = _.find(company.stores, { is_main: true });
        this.foreign_store_id = fromStore.id;
    }

    static async nextNumber(prefix) {
        const begin = new Date();
        begin.setMonth(0, 1);
        begin.setHours(0, 0, 0, 0);
        const last = await this.findOne({
            where: { date: { [Sequelize.Op.gt]: begin }, number_prefix: prefix || null },
            order: [['number', 'DESC']],
        });
        return last ? last.number + 1 : 1;
    }
}
