import ApiController from './ApiControllerClassic';

export default class GoodController extends ApiController {
    constructor(db) {
        super(db.models.Good);
    }

    scopes = [
        'withStore',
        'withProduct',
    ];
}
