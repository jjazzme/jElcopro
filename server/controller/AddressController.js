import ApiController from './ApiController';

export default class AddressController extends ApiController {
    constructor(db) {
        super(db.models.Address);
    }
}
