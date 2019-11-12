import ModelService from './ModelService';
import db from '../models';
import DocumentLineService from './DocumentLineService';
import GoodService from './GoodService';
import FutureReserveService from './FutureReserveService';

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
        const lineFrom = await (new DocumentLineService())
            .find({ id: arrival.document_line_id }, transaction);
        lineFrom.good.ballance += arrival.ballance;
        const good = await (new GoodService()).save(lineFrom.good, transaction);
        const service = new FutureReserveService();
        await service.checkFutureReserveByGood(good, transaction);
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
        await (new GoodService()).save(lineFrom.good, transaction);
    }
}
