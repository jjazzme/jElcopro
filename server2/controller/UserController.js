import ApiController from './ApiController';

export default class UserController extends ApiController {
    constructor(db) {
        super(db.models.User);
    }

    async get(req, res){

        let id = parseInt(req.params.id);
        if (id === 0) id = 1;
        return this.Model.getInstance(id);

    };
}
