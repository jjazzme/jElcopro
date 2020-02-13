import ApiController from './ApiController';

export default class ProductController extends ApiController {
    scopes = [
        'withProducer',
        'withCategory',
    ];

    constructor(db) {
        super(db.models.Product);
    }
}
