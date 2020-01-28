import DocumentController from './DocumentControllerClassic';

export default class TransferInController extends DocumentController {
    constructor(db) {
        super(db.models.TransferIn);
    }
}
