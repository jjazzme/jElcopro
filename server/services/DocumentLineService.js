import Sequelize from 'sequelize';
import _ from 'lodash';
import db from '../models';
import ModelService from './ModelService';
import GoodService from './GoodService';
// eslint-disable-next-line import/no-cycle
import ArrivalService from './ArrivalService';

const {
    Arrival, Departure, Document, DocumentLine, FutureReserve, Good, Product, Reserve,
} = db;

export default class DocumentLineService extends ModelService {
    constructor() {
        super(DocumentLine);
        this._includes = [
            { model: Document, as: 'document' },
            { model: DocumentLine, as: 'parent' },
            { model: DocumentLine, as: 'children' },
            { model: Arrival, as: 'arrival' },
            { model: Departure, as: 'departure' },
            { model: FutureReserve, as: 'futureReserve' },
            { model: Reserve, as: 'reserves' },
            { model: Good, as: 'good', include: [{ model: Product, as: 'product' }] },
        ];
    }

    /**
     * Parent quantity must more then sum quantity children
     * @param {DocumentLine} line
     * @returns {Promise<void>}
     * @private
     */
    // eslint-disable-next-line class-methods-use-this
    async _checkChildrenQuantity(line) {
        const { Op } = db.Sequelize;
        const children = line.children ? line.children
            : await DocumentLine.findAll(
                {
                    where:
                        {
                            [Op.and]: [
                                { parent_id: line.id },
                                { parent_id: { [Op.ne]: null } },
                            ],
                        },
                },
            );
        if (children.length > 0) {
            const sumQuantity = children.reduce((sum, child) => sum + child.quantity, 0);
            if (line.quantity < sumQuantity) {
                throw new Error(`${line.quantity} less than possible ${sumQuantity}`);
            }
        }
    }

    /**
     * Sum quantity children lines must less then parent quantity
     * @param {DocumentLine} line
     * @returns {Promise<void>}
     * @private
     */
    async _checkParentQuantity(line) {
        if (line.parent_id) {
            const parent = await this.getModel(line.parent_id);
            const previousQuantity = line.previous('quantity') ? line.previous('quantity') : 0;
            const sumQuantity = parent.children.reduce((sum, child) => sum + child.quantity, 0)
                - previousQuantity + line.quantity;
            if (sumQuantity > parent.quantity) {
                const possibleQuantity = parent.quantity - sumQuantity + line.quantity;
                throw new Error(`${line.quantity} more than possible ${possibleQuantity}`);
            }
        }
    }

    /**
     * Reserve procedure
     * @param {DocumentLine} line
     * @param {Transaction} transaction
     * @param {number|null} reserved
     * @returns {Promise<number>}
     * @private
     */
    async _reserveLines(line, transaction, reserved) {
        const reserves = reserved || this._reserveQuantity(line);
        let needReserve = line.quantity - reserves;
        const { Op } = Sequelize;
        const arrivals = await Arrival.findAll({
            where: { ballance: { [Op.gt]: 0 } },
            include: { model: DocumentLine, as: 'documentLine', where: { good_id: line.good_id } },
            transaction,
        });
        // eslint-disable-next-line no-restricted-syntax,no-unused-vars
        for (const arrival of arrivals) {
            if (arrival.ballance > needReserve) {
                arrival.ballance -= needReserve;
                await (new ArrivalService()).update(arrival, transaction);
                await Reserve.create(
                    {
                        document_line_id: line.id, arrival_id: arrival.id, quantity: needReserve, closed: false,
                    },
                    { transaction },
                );
                needReserve = 0;
                break;
            } else {
                needReserve -= arrival.ballance;
                // eslint-disable-next-line no-await-in-loop
                await Reserve.create(
                    {
                        document_line_id: line.id, arrival_id: arrival.id, quantity: arrival.ballance, closed: false,
                    },
                    { transaction },
                );
                arrival.ballance = 0;
                await (new ArrivalService()).update(arrival, transaction);
            }
        }
        /*
        if (needReserve !== line.quantity - reserves) {
            // eslint-disable-next-line require-atomic-updates
            line.good.ballance -= line.quantity - reserves - needReserve;
            await line.good.save({ transaction });
        }
        */
        return line.quantity - reserves - needReserve;
    }

    /**
     * Sum reserve quantity for this line
     * @param {DocumentLine} line
     * @returns {number}
     * @private
     */
    // eslint-disable-next-line class-methods-use-this
    _reserveQuantity(line) {
        return line.reserves.reduce((sum, reserve) => sum + reserve.quantity, 0)
            + line.children.reduce((sum, child) => sum + child.quantity, 0);
    }

    /**
     * Before Create new DocumentLine resolve dependencies on right Good & Store
     * @param {DocumentLine} item
     * @param {Transaction} transaction
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async beforeCreate(item, transaction) {
        if (!item.document_id) throw new Error('Attribute document_id required');
        const document = item.document ? item.document
            : await Document.findOne({ where: { id: item.document_id }, transaction });
        if (!document) throw new Error('Attribute document_id wrong');
        const productId = await (item.product_id ? item.product_id
            : (await Good.findOne({ where: { id: item.good_id } })).product_id);
        const good = await (new GoodService()).firstOrCreate({
            product_id: productId,
            store_id: document.store_id,
            code: productId,
        }, {
            pack: 1,
            multiply: 1,
            is_active: true,
            ballance: 0,
        });
        item.store_id = document.store_id;
        item.from_good_id = item.good_id;
        item.good_id = good.id;
    }

    /**
     * Chech quantity and re-sum before update or create;
     * @param {DocumentLine} line
     * @returns {Promise<void>}
     */
    async beforeUpdateOrCreate(line) {
        const changes = line.changed();
        if (changes && changes.includes('quantity')) {
            await this._checkParentQuantity(line);
            await this._checkChildrenQuantity(line);
            if (!changes.includes('amount_without_vat')) {
                line.amount_without_vat = line.price_without_vat * line.quantity;
            }
            if (!changes.includes('amount_with_vat')) {
                line.amount_with_vat = line.price_with_vat * line.quantity;
            }
        }
    }

    /**
     * Check Try destroy transferOut line
     * @param line
     * @param transaction
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async beforeDestroy(line, transaction) {
        if (line.departure) {
            if (line.document.closed) throw new Error('Parent TransferOut was closed');
            await Reserve.create(
                {
                    document_line_id: line.parent_id,
                    arrival_id: line.departure.arrival_id,
                    quantity: line.quantity,
                    closed: true,
                },
                { transaction },
            );
            await line.departure.destroy({ transaction });
        }
    }

    /**
     * Create TransferIn lines
     * @param {Document} childDocument
     * @param {Array|null} parentLineIds
     * @param {Transaction} transaction
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async createChildren(childDocument, parentLineIds, transaction) {
        const where = { document_id: childDocument.parent_id };
        if (parentLineIds && parentLineIds instanceof Array) {
            where.id = { [db.Sequelize.Op.in]: parentLineIds };
        }
        const parentLines = await DocumentLine.findAll({
            where,
            transaction,
            attributes: {
                include: [
                    [
                        db.sequelize.literal('COALESCE('
                            + '(SELECT sum(a.quantity) FROM document_lines a '
                            + 'WHERE a.parent_id = `DocumentLine`.`id`), 0)'),
                        'childrenQuantity',
                    ],
                    [
                        db.sequelize.literal('COALESCE('
                            + '(SELECT sum(a.amount_without_vat) FROM document_lines a '
                            + 'WHERE a.parent_id = `DocumentLine`.`id`), 0)'),
                        'childrenAmountWithoutVat',
                    ],
                    [
                        db.sequelize.literal('COALESCE('
                            + '(SELECT sum(a.amount_with_vat) FROM document_lines a '
                            + 'WHERE a.parent_id = `DocumentLine`.`id`), 0)'),
                        'childrenAmountWithVat',
                    ],
                ],
            },
        });
        const newLines = parentLines.filter((line) => {
            const values = line.get({ palin: true });
            return values.quantity - values.childrenQuantity > 0;
        })
            .map((line) => {
                const values = _.omit(line.get({ plain: true }), ['id', 'createdAt', 'updatedAt']);
                return Object.assign(values, {
                    parent_id: line.id,
                    document_id: childDocument.id,
                    quantity: line.quantity - values.childrenQuantity,
                    amount_with_vat: line.amount_with_vat - values.childrenAmountWithVat,
                    amount_without_vat: line.amount_without_vat - values.childrenAmountWithoutVat,
                });
            });
        await DocumentLine.bulkCreate(newLines, { transaction });
    }

    /**
     * Create TransferOut lines
     * @param {TransferOut} transferOut
     * @param {Transaction} transaction
     * @returns {Promise<void>}
     */
    async createTransferOutLines(transferOut, transaction) {
        const reserves = await Reserve.findAll({
            where: { closed: true },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: transferOut.parent_id } },
            ],
            transaction,
        });
        if (reserves.length === 0) throw new Error('Nothing to do');
        // eslint-disable-next-line no-unused-vars
        for (const reserve of reserves) {
            const line = await this.getModel(reserve.document_line_id, transaction);
            let newLine = Object.assign(line.get({ plain: true }), {
                document_id: transferOut.id,
                quantity: reserve.quantity,
                parent_id: line.id,
            });
            newLine = _.omit(newLine, ['id', 'createdAt', 'updatedAt']);
            newLine = await this.create(newLine, transaction);
            await Departure.create({ document_line_id: newLine.id, arrival_id: reserve.arrival_id }, { transaction });
            await reserve.destroy({ transaction });
        }
    }

    /**
     * Transfer FutureReserve in resereve if it possible
     * @param {Good|number} good
     * @param {Transaction} transaction
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async checkFutureReserveByGood(good, transaction) {
        const goodInstance = await (new GoodService()).getModel(good, transaction);
        const futureReserves = await FutureReserve.findAll({
            include: [
                {
                    model: DocumentLine,
                    as: 'documentLine',
                    include: [{ model: Good, as: 'good', where: { id: goodInstance.id } }],
                },
            ],
            order: ['createdAt'],
            transaction,
        });
        // eslint-disable-next-line no-unused-vars
        for (const fr of futureReserves) {
            await this.reserve(fr.documentLine, { transaction });
        }
    }

    /**
     * Make reserves && future reserve for document line
     * @param {DocumentLine|number} line
     * @param {Object} params
     * @param {boolean} params.own - Reserve only goods that was from our store
     * @param {Transaction} params.transaction
     * @returns {Promise<number>}
     */
    async reserve(line, params) {
        const lineInstance = await this.getModel(line, params.transaction);
        const reserveQuantity = this._reserveQuantity(lineInstance);
        let reserved = 0;
        if (reserveQuantity < lineInstance.quantity) {
            if ((lineInstance.good_id === lineInstance.from_good_id && params.own) || !params.own) {
                reserved = await this._reserveLines(lineInstance, params.transaction, reserveQuantity);
            }
        }
        if (!lineInstance.futureReserve && (lineInstance.quantity !== reserveQuantity + reserved)) {
            await FutureReserve.create(
                { document_line_id: lineInstance.id, ballance: lineInstance.quantity - reserveQuantity - reserved },
                { transaction: params.transaction },
            );
        } else if (line.futureReserve && (lineInstance.quantity !== reserveQuantity + reserved)) {
            lineInstance.futureReserve.ballance = lineInstance.quantity - reserveQuantity - reserved;
            await lineInstance.futureReserve.save({ transaction: params.transaction });
        } else if (lineInstance.futureReserve) {
            await lineInstance.futureReserve.destroy({ transaction: params.transaction });
        }
        return reserved;
    }

    /**
     * Unreserve && destroy future reserve for document line
     * @param {DocumentLine|number} line
     * @param {Object} params
     * @param {Transaction} params.transaction
     * @returns {Promise<*>}
     */
    async unreserve(line, params) {
        const lineInstance = await this.getModel(line, params.transaction);
        let backToStore = 0;
        const service = new ArrivalService();
        if (lineInstance.futureReserve) {
            await lineInstance.futureReserve.destroy({ transaction: params.transaction });
        }
        // eslint-disable-next-line no-unused-vars,no-restricted-syntax
        for (const reserve of lineInstance.reserves) {
            if (reserve.closed) {
                throw new Error(`${lineInstance.good.product.name} подоbран, снять резерв не возможно`);
            }
            backToStore += reserve.quantity;
            const arrival = await service.getModel(reserve.arrival_id, params.transaction);
            arrival.ballance += reserve.quantity;
            await service.update(arrival, params.transaction);
            await reserve.destroy({ transaction: params.transaction });
        }
        return backToStore;
    }
}
