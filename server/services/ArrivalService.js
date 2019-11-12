import ModelService from "./ModelService";
import db from '../models';
import DocumentLineService from "./DocumentLineService";

const { Arrival, DocumentLine, FutureReserve, Good } = db;

export default class ArrivalService extends ModelService {
    constructor() {
        super(Arrival);
    }

    async afterCreate(arrival, transaction) {
        const lineFrom = await (new DocumentLineService())
            .find({ id: arrival.document_line_id }, transaction);


    }
}