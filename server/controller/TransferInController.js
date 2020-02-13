import DocumentController from './DocumentController';

export default class TransferInController extends DocumentController {
    constructor(db) {
        super(db.models.TransferIn);
    }
}
