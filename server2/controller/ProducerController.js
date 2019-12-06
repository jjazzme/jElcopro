import ApiController from './ApiController';

export default class ProducerController extends ApiController {
    constructor(db) {
        super(db.models.Producer);
    }
}
