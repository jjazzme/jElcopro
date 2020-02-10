import ApiController from './ApiControllerClassic';

export default class ProductController extends ApiController {
    scopes = [
        'withProducer',
        'withCategory',
    ];

    constructor(db) {
        super(db.models.Product);
    }
}
