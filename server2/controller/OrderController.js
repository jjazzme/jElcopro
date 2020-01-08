import DocumentController from './DocumentController';

export default class OrderController extends DocumentController {
    constructor(db) {
        super(db.models.Order);
    }
}
