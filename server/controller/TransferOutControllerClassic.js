import DocumentController from './DocumentControllerClassic';

export default class TransferOutController extends DocumentController {
    constructor(db) {
        super(db.models.TransferOut);
    }
}
