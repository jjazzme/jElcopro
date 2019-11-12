import DocumentService from './DocumentService';
import db from '../models';
import OrderService from "./OrderService";
const { Document, DocumentLine, Order, TransferIn } = db;

export default class TransferInService extends DocumentService {
    constructor() {
        super(TransferIn);
        this._transitions = [

        ];
        this._includes = this._includes.concat(
            { model: DocumentLine, as: 'documentLines' },
            { model: Order, as: 'parent', required: false },
            { model: Document, as: 'children', required: false },
        );
    }

    /**
     * Create child TransferIn for Order
     * @param optics - TODO need write properties
     * @returns {Promise<Object>}
     */
    async createTransferIn(optics) {
        try {
            const parent = await (new OrderService()).find({ id: optics.parent_id });
            const child = await this.createChild(
                parent,
                {
                    document_type_id: 'transfer-in',
                    number: optics.number,
                    number_prefix: optics.number_prefix,
                    user_id: optics.user_id,
                    status_id: 'formed'
                },
                optics.lines
            );
            return await this.find({ id: child.id })
        } catch (e) {
            throw e
        }
    }

    async hold(transfer) {
        const instance = await this.getModel(transfer);
        const t = await db.sequelize.transaction();
        for (const line of instance.documentLines) {

        }
    }
}