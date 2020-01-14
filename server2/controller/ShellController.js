import ApiController from './ApiController';

export default class ShellController extends ApiController {
    constructor(db) {
        super(db.models.Shell);
    }

    async get(req) {
        const id = parseInt(req.params.id, 0);
        if (id === 0) return req.user;
        return this.Model.getInstance(id);
    }
}
