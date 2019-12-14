import _ from 'lodash';
import Sequelize, { Op } from 'sequelize';
import BaseModel from './BaseModel';

export default class DocumentLine extends BaseModel {
    /**
     * Parent quantity must more then sum quantity children
     */
    async checkChildrenQuantity() {
        this.children = this.children || await this.getChildren({ where: { parent_id: { [Op.ne]: null } } });
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
            const document = line.document || await line.getDocument();
            const changes = line.changed();
            if (changes && !changes.includes('closed') && document.status_id !== 'formed') {
                throw new Error('Document must be in formed status');
            }
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
            const document = line.document || await line.getDocument();
            if (document.status_id !== 'formed') throw new Error('Document must be in formed status');
            const { Reserve } = this.services.db.models;
            if (line.closed) {
                throw new Error('Has not closed lines');
            }
            line.departure = line.departure || await line.getDeparture();
            if (line.departure) {
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
            ? optics.parentLines.map((line) => (_.isNumber(line) ? line : line.id)) : null;
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

    static async createTransferCorrectiveLines(child, optics) {
        const parentLineIds = optics.parentLines
            ? optics.parentLines.map((line) => (_.isNumber(line) ? line : line.id)) : null;
        const parentLines = await DocumentLine.findAll({
            where: { id: { [Sequelize.Op.in]: parentLineIds } },
        });
        const newLines = parentLines
            .map((line) => {
                const values = _.omit(line.get({ plain: true }), ['id', 'createdAt', 'updatedAt']);
                return Object.assign(values, { parent_id: line.id, document_id: child.id });
            });
        await this.bulkCreate(newLines, { individualHooks: true });
    }

    /**
     * Create TransferOut lines
     * @param {TransferOut} child
     * @returns {Promise<void>}
     */
    static async createTransferOutLines(child) {
        const { Departure, Reserve } = this.services.db.models;
        const reserves = await Reserve.findAll({
            where: { closed: true },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: child.parent_id } },
            ],
        });
        if (reserves.length === 0) throw new Error('Nothing to do');
        // eslint-disable-next-line no-unused-vars
        for (const reserve of reserves) {
            let newLine = Object.assign(reserve.documentLine.get({ plain: true }), {
                document_id: child.id,
                quantity: reserve.quantity,
                parent_id: reserve.documentLine.id,
            });
            newLine = _.omit(newLine, ['id', 'createdAt', 'updatedAt']);
            newLine = await this.create(newLine);
            await Departure.create({ document_line_id: newLine.id, arrival_id: reserve.arrival_id });
            await reserve.destroy();
        }
    }

    /**
     * Sum reserve quantity for this line
     * @returns {number}
     * @private
     */
    async reserveQuantity() {
        this.reserves = this.reserves || await this.getReserves();
        this.children = this.children || await this.getChildren();
        return this.reserves.reduce((sum, reserve) => sum + reserve.quantity, 0)
            + this.children.reduce((sum, child) => sum + child.quantity, 0);
    }

    /**
     * Reserve procedure
     * @param {number|null} reserved
     * @returns {Promise<number>}
     * @private
     */
    async makeReserves(reserved) {
        const reserves = reserved || await this.reserveQuantity();
        let needReserve = this.quantity - reserves;
        const { Arrival, Reserve } = this.services.db.models;
        const parent = this.parent_id ? await this.getParent({ scope: ['withArrival'] }) : false;
        const where = { ballance: { [Op.gt]: 0 } };
        if (parent) where.id = parent.arrival ? parent.arrival.id : 0;
        const arrivals = await Arrival.findAll({
            where,
            include: { model: DocumentLine, as: 'documentLine', where: { good_id: this.good_id } },
        });
        // eslint-disable-next-line no-restricted-syntax,no-unused-vars
        for (const arrival of arrivals) {
            if (arrival.ballance > needReserve) {
                arrival.ballance -= needReserve;
                await arrival.save();
                await Reserve.create(
                    {
                        document_line_id: this.id, arrival_id: arrival.id, quantity: needReserve, closed: false,
                    },
                );
                needReserve = 0;
                break;
            } else {
                needReserve -= arrival.ballance;
                // eslint-disable-next-line no-await-in-loop
                await Reserve.create(
                    {
                        document_line_id: this.id, arrival_id: arrival.id, quantity: arrival.ballance, closed: false,
                    },
                );
                arrival.ballance = 0;
                await arrival.save();
            }
        }
        return this.quantity - reserves - needReserve;
    }

    /**
     * Make reserves && future reserve for document line
     * @param {Object} params
     * @param {boolean} [params.own=false] - Reserve only goods that was from our store
     * @returns {Promise<number>}
     */
    async reserve(params = { own: false }) {
        const { FutureReserve } = this.services.db.models;
        const reserveQuantity = await this.reserveQuantity();
        let reserved = 0;
        if (reserveQuantity < this.quantity) {
            if ((this.good_id === this.from_good_id && params.own) || !params.own) {
                reserved = await this.makeReserves(reserveQuantity);
            }
        }
        this.futureReserve = this.futureReserve || await this.getFutureReserve();
        if (!this.futureReserve && (this.quantity !== reserveQuantity + reserved)) {
            await FutureReserve.create(
                { document_line_id: this.id, ballance: this.quantity - reserveQuantity - reserved },
            );
        } else if (this.futureReserve && (this.quantity !== reserveQuantity + reserved)) {
            this.futureReserve.ballance = this.quantity - reserveQuantity - reserved;
            await this.futureReserve.save();
        } else if (this.futureReserve) {
            await this.futureReserve.destroy();
        }
        return reserved;
    }

    /**
     * Unreserve && destroy future reserve for document line
     * @returns {Promise<*>}
     */
    async unreserve() {
        let backToStore = 0;
        this.reserves = this.reserves || await this.getReserves();
        // eslint-disable-next-line no-unused-vars,no-restricted-syntax
        for (const reserve of this.reserves) {
            if (reserve.closed) {
                this.good = this.good || await this.getGood({ scope: ['withProduct'] });
                throw new Error(`${this.good.product.name} подоbран, снять резерв не возможно`);
            }
            backToStore += reserve.quantity;
            const arrival = await reserve.getArrival();
            arrival.ballance += reserve.quantity;
            await arrival.save();
            await reserve.destroy();
        }
        return backToStore;
    }
}
