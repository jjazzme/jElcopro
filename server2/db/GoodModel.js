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

    async discard(document, quantity) {
        const {
            Defective, Arrival, DocumentLine, Reserve,
        } = this.services.db.models;
        const defective = await Defective.getInstance(document);
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
                include: [{ model: DocumentLine, as: 'documentLine', where: { good_is: this.id } }],
                order: [['quantity', 'desc']],
            });
            // eslint-disable-next-line no-unused-vars
            for (const reserve of reserves) {
                if (reserve.quantity > needToDiscard) {
                    const arrival = reserve.getArrival({ scope: ['withDocumentLine'] });
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
                    const arrival = reserve.getArrival({ scope: ['withDocumentLine'] });
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
        return DocumentLine
            .scope('withGood')
            .findAll({ where: { good_id: this.id, document_id: defective.id } });
    }
}
