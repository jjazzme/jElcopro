import ApiController from './ApiController';

export default class UserController extends ApiController {
    constructor(db) {
        super(db.models.User);
    }

    async get(req, res){

        let id = parseInt(req.params.id);
        if (id === 0) id = 1;
        let ret = {a: 2, b: 4};

        try{
            const t = this.Model.getInstance(id)
        } catch (e) {
            res.status(500).send(e.message)
        }

        return t;

    };
}
