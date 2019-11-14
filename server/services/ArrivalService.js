import ModelService from './ModelService';
import db from '../models';
import GoodService from './GoodService';
import DocumentLineService from './DocumentLineService';

const { Arrival } = db;

export default class ArrivalService extends ModelService {
    constructor() {
        super(Arrival);
    }

    /**
     * Increase good ballance & Check FutureReserve after arrival create
     * @param {Arrival} arrival
     * @param {Transaction} transaction
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async afterCreate(arrival, transaction) {
        const service = new DocumentLineService();
        const lineFrom = await service.find({ id: arrival.document_line_id }, transaction);
        lineFrom.good.ballance += arrival.ballance;
        const good = await (new GoodService()).update(lineFrom.good, transaction);
        await service.checkFutureReserveByGood(good, transaction);
    }

    /**
     * Change good ballance
     * @param arrival
     * @param transaction
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async beforeUpdate(arrival, transaction) {
        const service = new DocumentLineService();
        const lineFrom = await service.find({ id: arrival.document_line_id }, transaction);
        lineFrom.good.ballance += arrival.ballance - arrival.previous('ballance');
        const good = await (new GoodService()).update(lineFrom.good, transaction);
        if (arrival.ballance > arrival.previous('ballance')) {
            await service.checkFutureReserveByGood(good, transaction);
        }
    }

    /**
     * Decrease good ballance or Error before arrival destroy
     * @param arrival
     * @param transaction
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async beforeDestroy(arrival, transaction) {
        const lineFrom = await (new DocumentLineService())
            .find({ id: arrival.document_line_id }, transaction);
        if (lineFrom.quantity !== arrival.ballance) throw new Error('Check reserves & departures');
        lineFrom.good.ballance -= arrival.ballance;
        if (lineFrom.good.ballance < 0) throw new Error('Impossible minus ballance');
        await (new GoodService()).update(lineFrom.good, transaction);
    }
}
