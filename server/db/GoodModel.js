import { Op } from 'sequelize';
import BaseModel from './BaseModel';

export default class Good extends BaseModel {
    /**
     * Transfer FutureReserve in resereve if it possible
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async checkFutureReserve() {
        const { FutureReserve } = this.services.db.models;
        const futureReserves = await FutureReserve.scope({ method: ['withGood', this] }).findAll();
        // eslint-disable-next-line no-unused-vars
        for (const fr of futureReserves) {
            await fr.documentLine.reserve();
        }
    }

    /**
     * Disactivate ended goods
     * @param {number} storeId
     * @param {Date} start
     * @returns {Promise<int>}
     */
    static async disactivate(storeId, start) {
        const [numberOfAffectedRows] = await this.update(
            { is_active: false, ballance: 0 },
            { where: { is_active: true, store_id: storeId, updatedAt: { [Op.lt]: start } } },
        );
        return numberOfAffectedRows;
    }

    /**
     * Discard good
     * @param {Document|number} document
     * @param {number} quantity
     * @param { Object= } transaction
     * @returns {Promise<Model<any, any>[]>}
     */
    async discard(document, quantity, transaction = null) {
        const {
            Defective, Arrival, DocumentLine, Reserve,
        } = this.services.db.models;
        const defective = await Defective.getInstance(document);
        const run = async () => {
            if (!defective) throw new Error('Not deffective document');
            let needToDiscard = quantity;
            const arrivals = await Arrival.findAll({
                where: { ballance: { [Op.gt]: 0 } },
                include: { model: DocumentLine, as: 'documentLine', where: { good_id: this.id } },
                order: [['ballance', 'desc']],
            });
            // eslint-disable-next-line no-restricted-syntax,no-unused-vars
            for (const arrival of arrivals) {
                if (arrival.ballance > needToDiscard) {
                    await DocumentLine.create({
                        document_id: defective.id,
                        parent_id: arrival.documentLine.id,
                        good_id: this.id,
                        quantity: needToDiscard,
                        vat: arrival.documentLine.vat,
                        price_without_vat: arrival.documentLine.price_without_vat,
                        closed: false,
                        from_good_id: arrival.documentLine.from_good_id,
                    });
                    needToDiscard = 0;
                    break;
                } else {
                    needToDiscard -= arrival.ballance;
                    // eslint-disable-next-line no-await-in-loop
                    await DocumentLine.create({
                        document_id: defective.id,
                        parent_id: arrival.documentLine.id,
                        good_id: this.id,
                        quantity: arrival.ballance,
                        vat: arrival.documentLine.vat,
                        price_without_vat: arrival.documentLine.price_without_vat,
                        closed: false,
                        from_good_id: arrival.documentLine.from_good_id,
                    });
                }
            }
            if (needToDiscard > 0) {
                const reserves = await Reserve.findAll({
                    where: { closed: false },
                    include: [{ model: DocumentLine, as: 'documentLine', where: { good_id: this.id } }],
                    order: [['quantity', 'desc']],
                });
                // eslint-disable-next-line no-unused-vars
                for (const reserve of reserves) {
                    if (reserve.quantity > needToDiscard) {
                        const arrival = await reserve.getArrival({ scope: ['withDocumentLine'] });
                        await DocumentLine.create({
                            document_id: defective.id,
                            parent_id: reserve.documentLine.id,
                            good_id: this.id,
                            quantity: needToDiscard,
                            vat: arrival.documentLine.vat,
                            price_without_vat: arrival.documentLine.price_without_vat,
                            closed: false,
                            from_good_id: arrival.documentLine.from_good_id,
                        });
                        break;
                    } else {
                        needToDiscard -= reserve.quantity;
                        const arrival = await reserve.getArrival({ scope: ['withDocumentLine'] });
                        await DocumentLine.create({
                            document_id: defective.id,
                            parent_id: reserve.documentLine.id,
                            good_id: this.id,
                            quantity: reserve.quantity,
                            vat: arrival.documentLine.vat,
                            price_without_vat: arrival.documentLine.price_without_vat,
                            closed: false,
                            from_good_id: arrival.documentLine.from_good_id,
                        });
                    }
                }
            }
            if (needToDiscard > 0) throw new Error('Not need quantity');
        };
        if (transaction) await run();
        else await this.services.dbConnection.transaction(async () => run());
        return DocumentLine
            .scope('withGood')
            .findAll({ where: { good_id: this.id, document_id: defective.id } });
    }

    /**
     * Reestablish
     * @param {Document|number} document
     * @param {number} quantity
     * @param {Object} transaction
     * @returns {Promise<DocumentLine>}
     */
    async reestablish(document, quantity, transaction = null) {
        const {
            Undefective, DocumentLine,
        } = this.services.db.models;
        const undefective = await Undefective.getInstance(document);
        const run = async () => {
            if (!undefective) throw new Error('Need Undefective document');
            await DocumentLine.create({
                document_id: undefective.id,
                good_id: this.id,
                quantity,
                vat: 0,
                price_without_vat: 0,
                closed: false,
                from_good_id: this.id,
            });
        };
        if (transaction) await run();
        else await this.services.dbConnection.transaction(async () => run());
        return DocumentLine
            .scope('withGood')
            .findOne({
                where: { good_id: this.id, document_id: undefective.id },
                order: [['id', 'DESC']],
            });
    }

    /**
     * Create Movement DocumentLine
     * @param {Movement} movement
     * @param {number} quantity
     * @returns {Promise<DocumentLine>}
     */
    async toMovementDocumentLine(movement, quantity) {
        const { DocumentLine } = this.services.db.models;
        if (quantity > this.ballance) throw new Error('Not enough quantity');
        return DocumentLine.create({
            document_id: movement.id,
            good_id: this.id,
            quantity,
            vat: 0,
            price_without_vat: 0,
        });
    }

    /**
     * Check integrity
     * @returns {Promise<boolean>}
     */
    async arrivalsCheck() {
        const { Arrival, DocumentLine } = this.services.db.models;
        const arrivalsBallance = await Arrival.sum(
            'ballance',
            {
                where: { ballance: { [Op.gt]: 0 } },
                include: [{ model: DocumentLine, as: 'documentLine', where: { good_id: this.id } }],
            },
        );
        return arrivalsBallance === this.ballance;
    }

    /**
     * Reserves quantity
     * @returns {Promise<number>}
     */
    async reservesQuantity() {
        const { Reserve, DocumentLine } = this.services.db.models;
        return Reserve.sum(
            'Reserve.quantity',
            {
                include: [{ model: DocumentLine, as: 'documentLine', where: { good_id: this.id } }],
            },
        );
    }

    /**
     * FutureReserves quantity
     * @returns {Promise<number>}
     */
    async futureReservesBallance() {
        const { FutureReserve, DocumentLine } = this.services.db.models;
        return FutureReserve.sum(
            'ballance',
            {
                include: [{ model: DocumentLine, as: 'documentLine', where: { good_id: this.id } }],
            },
        );
    }
}
