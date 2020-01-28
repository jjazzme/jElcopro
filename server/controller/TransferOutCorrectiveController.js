import DocumentController from './DocumentController';

export default class TransferOutCorrectiveController extends DocumentController {
    constructor(db) {
        super(db.models.TransferOutCorrective);
    }
}
