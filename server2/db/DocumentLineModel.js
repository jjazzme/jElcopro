import _ from 'lodash';
import Sequelize from 'sequelize';
import BaseModel from './BaseModel';

export default class DocumentLine extends BaseModel {
    /**
     * Parent quantity must more then sum quantity children
     */
    async checkChildrenQuantity() {
        this.children = this.children || await this.getChildren();
        if (this.children.length > 0) {
            const sumQuantity = this.children.reduce((sum, child) => sum + child.quantity, 0);
            if (this.quantity < sumQuantity) {
                throw new Error(`${this.quantity} less than possible ${sumQuantity}`);
            }
        }
    }

    /**
     * Sum quantity children lines must less then parent quantity
     */
    async checkParentQuantity() {
        if (this.parent_id) {
            this.parent = this.parent || await this.getParent({ scope: ['withChildren'] });
            const previousQuantity = this.previous('quantity') ? this.previous('quantity') : 0;
            const sumQuantity = this.parent.children.reduce((sum, child) => sum + child.quantity, 0)
                - previousQuantity + this.quantity;
            if (sumQuantity > this.parent.quantity) {
                const possibleQuantity = this.parent.quantity - sumQuantity + this.quantity;
                throw new Error(`${this.quantity} more than possible ${possibleQuantity}`);
            }
        }
    }

    static registerHooks() {
        /**
          * Before Create new DocumentLine resolve dependencies on right Good & Store
          */
        this.beforeCreate(async (line) => {
            const { Good } = this.services.db.models;
            const document = line.document || await line.getDocument();
            if (!document) throw new Error('Attribute document_id wrong');
            const productId = line.product_id || (await Good.getInstance({ id: line.good_id })).product_id;
            const good = await Good.getInstanceOrCreate(
                { product_id: productId, store_id: document.store_id, code: productId },
                {
                    pack: 1, multiply: 1, is_active: true, ballance: 0,
                },
            );
            line.store_id = document.store_id;
            line.from_good_id = line.good_id;
            line.good_id = good.id;
            if (!_.isNumber(line.price_with_vat)) line.price_with_vat = line.price_without_vat * (1 + line.vat / 100);
            if (!_.isNumber(line.amount_without_vat)) line.amount_without_vat = line.price_without_vat * line.quantity;
            if (!_.isNumber(line.amount_with_vat)) line.amount_with_vat = line.price_with_vat * line.quantity;
        });
        /**
         * Check quantity and re-sum before update or create;
         */
        this.beforeSave(async (line) => {
            const changes = line.changed();
            if (changes && changes.includes('quantity')) {
                await line.checkParentQuantity();
                await line.checkChildrenQuantity();
                if (!changes.includes('amount_without_vat')) {
                    line.amount_without_vat = line.price_without_vat * line.quantity;
                }
                if (!changes.includes('amount_with_vat')) {
                    line.amount_with_vat = line.price_with_vat * line.quantity;
                }
            }
        });
        /**
         * Check Try destroy transferOut line
         */
        this.beforeDestroy(async (line) => {
            const { Reserve } = this.services.db.models;
            line.departure = line.departure || await line.getDeparture();
            if (line.departure) {
                line.document = line.document || await line.getDocumen();
                if (line.document.closed) throw new Error('Parent TransferOut was closed');
                await Reserve.create(
                    {
                        document_line_id: line.parent_id,
                        arrival_id: line.departure.arrival_id,
                        quantity: line.quantity,
                        closed: true,
                    },
                );
                await line.departure.destroy();
            }
        });
        return this;
    }

    /**
     * Create TrensferIn Lines
     * @param {TransferIn} child
     * @param {Object} optics
     * @param {number} optics.parent_id
     * @param {number} optics.document_id
     * @param {DocumentLine[]|number[]=} optics.parentLines
     * @returns {Promise<void>}
     */
    static async createTransferInLines(child, optics) {
        const { literal } = this.services.db.connection;
        const parentLineIds = optics.parentLines
            ? optics.parentLines.map((line) => (Number.isNaN(line) ? line.id : line)) : null;
        const where = { document_id: optics.parent_id };
        if (parentLineIds && parentLineIds instanceof Array) {
            where.id = { [Sequelize.Op.in]: parentLineIds };
        }
        const parentLines = await DocumentLine.findAll({
            where,
            attributes: {
                include: [
                    [
                        literal('COALESCE('
                            + '(SELECT sum(a.quantity) FROM document_lines a '
                            + 'WHERE a.parent_id = `DocumentLine`.`id`), 0)'),
                        'childrenQuantity',
                    ],
                    [
                        literal('COALESCE('
                            + '(SELECT sum(a.amount_without_vat) FROM document_lines a '
                            + 'WHERE a.parent_id = `DocumentLine`.`id`), 0)'),
                        'childrenAmountWithoutVat',
                    ],
                    [
                        literal('COALESCE('
                            + '(SELECT sum(a.amount_with_vat) FROM document_lines a '
                            + 'WHERE a.parent_id = `DocumentLine`.`id`), 0)'),
                        'childrenAmountWithVat',
                    ],
                ],
            },
        });
        const newLines = parentLines
            .filter((line) => line.quantity > line.get('childrenQuantity'))
            .map((line) => {
                const values = _.omit(line.get({ plain: true }), ['id', 'createdAt', 'updatedAt']);
                return Object.assign(values, {
                    parent_id: line.id,
                    document_id: child.id,
                    quantity: line.quantity - values.childrenQuantity,
                    amount_with_vat: line.amount_with_vat - values.childrenAmountWithVat,
                    amount_without_vat: line.amount_without_vat - values.childrenAmountWithoutVat,
                });
            });
        await this.bulkCreate(newLines, { individualHooks: true });
    }
}
