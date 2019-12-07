import ApiController from './ApiController';

export default class UserController extends ApiController {
    constructor(db) {
        super(db.models.User);
    }

    async get(req) {
        let id = parseInt(req.params.id, 0);
        if (id === 0) id = 1;
        return this.Model.getInstance(id);
    }
}
