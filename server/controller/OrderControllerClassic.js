import DocumentController from './DocumentControllerClassic';

export default class OrderController extends DocumentController {
    constructor(db) {
        super(db.models.Order);
    }
}
