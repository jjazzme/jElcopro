import DocumentController from './DocumentController';

export default class GoodController extends DocumentController {
    constructor(db) {
        super(db.models.Good);
    }
}
