import CompanyController from './DocumentController';

export default class InvoiceController extends DocumentController {
    constructor(db) {
        super(db.models.Invoice);
    }
}
