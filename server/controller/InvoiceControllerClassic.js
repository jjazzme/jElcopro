import DocumentController from './DocumentControllerClassic';

export default class InvoiceController extends DocumentController {
    constructor(db) {
        super(db.models.Invoice);
    }
}
