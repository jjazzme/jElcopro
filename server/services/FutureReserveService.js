import ModelService from "./ModelService";
import db from '../models';
import GoodService from "./GoodService";
import DocumentLineService from "./DocumentLineService";

const { DocumentLine, FutureReserve, Good } = db;

export default class FutureReserveService extends ModelService {
    constructor() {
        super(FutureReserve);
    }

    /**
     * Transfer FutureReserve in resereve if it possible
     * @param {Good|number} good
     * @param {Transaction} transaction
     * @returns {Promise<void>}
     */
    async checkFutureReserveByGood(good, transaction) {
        const goodInstance = await (new GoodService()).getModel(good, transaction);
        const futureReserves = await FutureReserve.findAll({
            include: [
                {
                    model: DocumentLine,
                    as: 'documentLine',
                    include: [ { model: Good, as: 'good', where: { id: goodInstance.id } }],
                },
            ],
            order: [ 'createdAt' ],
            transaction
        });
        const service = new DocumentLineService();
        for (const fr of futureReserves) {
            await service.reserve(fr.documentLine, { transaction });
        }
    }
}