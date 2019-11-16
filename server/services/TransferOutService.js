import ModelService from './ModelService';
import {
    DocumentLine, Document, Invoice, TransferOut,
} from '../models';
import InvoiceService from './InvoiceService';

export default class TransferOutService extends ModelService {
    constructor() {
        super(TransferOut);
        this._includes = this._includes.concat(
            { model: DocumentLine, as: 'documentLines' },
            { model: Invoice, as: 'parent', required: false },
            { model: Document, as: 'children', required: false },
        );
    }

    /**
     * Create child TransferIn for Invoice
     * @param {Object} optics
     * @param {number} optics.parent_id
     * @param {number} optics.number
     * @param {string} optics.number_prefix
     * @param {number} optics.user_id
     * @returns {Promise<Object>}
     */
    async createTransferOut(optics) {
        const service = new InvoiceService();
        const parent = await service.find({ id: optics.parent_id });
        const child = await service.createChild(
            parent,
            {
                document_type_id: 'transfer-out',
                number: optics.number,
                number_prefix: optics.number_prefix,
                user_id: optics.user_id,
                status_id: 'formed',
            },
        );
        try {
            return await this.find({ id: child.id });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}
