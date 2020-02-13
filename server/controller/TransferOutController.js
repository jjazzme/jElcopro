import DocumentController from './DocumentController';

export default class TransferOutController extends DocumentController {
    constructor(db) {
        super(db.models.TransferOut);
    }
}
