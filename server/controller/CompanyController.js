import ApiController from './ApiController';

export default class CompanyController extends ApiController {
    scopes = [
        'withStores',
        'withAddress',
    ];

    constructor(db) {
        super(db.models.Company);
    }
}
