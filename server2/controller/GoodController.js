import DocumentController from './DocumentController';

export default class GoodController extends DocumentController {
    constructor(db) {
        super(db.models.Good);
    }

    scopes = [
        'withStore',
        'withProduct',
    ];

    async get(req) {
        return this.Model.getInstance(parseInt(req.params.id, 0), this.scopes);
    }
}
