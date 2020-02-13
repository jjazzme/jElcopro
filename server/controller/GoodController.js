import ApiController from './ApiController';

export default class GoodController extends ApiController {
    constructor(db) {
        super(db.models.Good);
    }

    scopes = [
        'withStore',
        'withProduct',
    ];
}
