import ApiController from './ApiController';

export default class ProductController extends ApiController {
    constructor(db) {
        super(db.models.Product);
    }
}
