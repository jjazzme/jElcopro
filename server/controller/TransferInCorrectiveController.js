import DocumentController from './DocumentController';

export default class TransferInCorrectiveController extends DocumentController {
    constructor(db) {
        super(db.models.TransferInCorrective);
    }
}
