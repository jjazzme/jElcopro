import ApiController from './ApiControllerClassic';

export default class ProducerController extends ApiController {
    constructor(db) {
        super(db.models.Producer);
    }

    scopes = ['withRightProducer'];
}
