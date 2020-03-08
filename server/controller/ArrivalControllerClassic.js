import ApiControllerClassic from './ApiControllerClassic';

export default class ArrivalController extends ApiControllerClassic {
    scopes = [
        'deepDocumentLine',
    ];

    constructor(db) {
        super(db.models.Arrival);
    }
}
