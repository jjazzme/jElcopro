import _ from 'lodash';
import Sequelize from 'sequelize';
import BaseModel from './BaseModel';

export default class Document extends BaseModel {
    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _closeTransition(params) {
        this.documentLines = this.documentLines || await this.getDocumentLines();
        if (!this.documentLines.reduce((result, line) => result && line.closed, true)) {
            throw new Error('Some lines for this document is not close!');
        }
        this.closed = true;
        return true;
    }

    static async createFromOptics(optics) {
        const newInstance = _.pick(optics, _.keys(this.tableAttributes));
        return this.create(newInstance);
    }

    static registerHooks() {
        /**
         * Before Create new DocumentLine resolve dependencies on right Good & Store
         */
        this.beforeCreate(async (doc) => {
            doc.set({ user_id: this.services.auth.user.id });
            if (!doc.store_id) await doc.fillStore();
            if (!doc.get('from_store_id')) await doc.fillFromStore();
            if (!_.isNumber(doc.number)) doc.number = await this.nextNumber(doc.number_prefix);
        });
    }

    async fillStore() {
        const { Company } = this.services.db.models;
        const companyId = ['order', 'transfer-in'].indexOf(this.document_type_id) >= 0
            ? this.buyerable_id : this.sellerable_id;
        const company = await Company.getInstance(companyId);
        this.store_id = _.find(company.stores, { is_main: true });
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
            order: ['number'],
        });
        return last ? last.number + 1 : 1;
    }
}
