import {
    Arrival, Departure, Document, DocumentLine, FutureReserve, Reserve
} from '../models';
import Entity from './Entity';
import Sequelize from "sequelize";

export default class DocumentLineService extends Entity {
    constructor() {
        super(DocumentLine);
        this._includes = [
            { model: Document, as: 'document' },
            { model: DocumentLine, as: 'parent' },
            { model: DocumentLine, as: 'children' },
            { model: Arrival, as: 'arrival' },
            { model: Departure, as: 'departure' },
            { model: FutureReserve, as: 'futureReserve' },
            { model: Reserve, as: 'resreves' },
        ];
    }

    /**
     * Make reserve && future reserve for document line
     * @param {DocumentLine|number} line
     * @param {Object} params
     * @param {boolean} params.own - Reserve only goods that was from our store
     * @param {Transaction} params.transaction
     * @returns {Promise<number>}
     */
    async reserve(line, params) {
        const lineInstance = await this.getInstance(line);
        const reserveQuantity = #reserveQuantity(lineInstance);
        let reserved = 0;
        if (reserveQuantity < lineInstance.quantity) {
            if ((lineInstance.good_id === lineInstance.from_good_id && params.own) || !params.own) {
                reserved = await #reserve(lineInstance, params.transaction, reserveQuantity);
            }
        }
        if (!lineInstance.futureReserve && lineInstance.quantity !== reserveQuantity + reserved) {
            await FutureReserve.create(
                { document_line_id: lineInstance.id, ballance: lineInstance.quantity - reserveQuantity - reserved },
                { transaction: params.transaction }
            );
        } else if (line.futureReserve && lineInstance.quantity !== reserveQuantity + reserved) {
            lineInstance.futureReserve.ballance = lineInstance.quantity - reserveQuantity - reserved;
            await lineInstance.futureReserve.save({ transaction: params.transaction });
        } else if (lineInstance.futureReserve) {
            await lineInstance.futureReserve.destroy({ transaction: params.transaction });
        }
        return reserved;
    }

    /**
     * Sum reserve quantity for this line
     * @param {DocumentLine} line
     * @returns {number}
     */
    #reserveQuantity(line) {
        return line.reserves.reduce((sum, reserve) => sum + reserve.quantity, 0);
    }

    /**
     * Reserve procedure
     * @param {DocumentLine} line
     * @param {Transaction} transaction
     * @param {number|null} reserved
     * @returns {Promise<number>}
     */
    async #reserve(line, transaction, reserved) {
        const reserves = reserved ? reserved_ : #reserveQuantity(line);
        let needReserve = line.quantity - reserves;
        const Op = Sequelize.Op;
        const arrivals = await Arrival.findAll({
            where: { ballance : { [Op.gt]: 0 } },
            include: { model: DocumentLine, as: 'documentLine', where: { good_id: line.good_id }}
        });
        for (const arrival of arrivals) {
            if (arrival.ballance > needReserve) {
                arrival.ballance -= needReserve;
                await arrival.save({ transaction: transaction });
                await Reserve.create(
                    { document_line_id: line.id, arrival_id: arrival.id, quantity: needReserve, closed: false },
                    { transaction: transaction },
                );
                needReserve = 0;
                break;
            } else {
                needReserve -= arrival.ballance;
                await Reserve.create(
                    { document_line_id: line.id, arrival_id: arrival.id, quantity: arrival.ballance, closed: false },
                    { transaction: transaction },
                );
                arrival.ballance = 0;
                await arrival.save({ transaction: transaction });
            }
        }
        if (needReserve !== line.quantity - reserves) {
            line.good.ballance -= line.quantity - reserves - needReserve;
            await line.good.save({ transaction: transaction });
        }
        return line.quantity - reserves - needReserve;
    }
}
