import ApiController from './ApiControllerClassic';

export default class UserController extends ApiController {
    constructor(db) {
        super(db.models.User);
    }
}
