import DocumentService from './DocumentService';
import {
    Document, DocumentLine, Order, TransferIn
} from '../models';

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
}