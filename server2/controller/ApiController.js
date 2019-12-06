export default class ModelContoller {
    constructor(Model) {
        this.Model = Model;
    }

    async index(optics) {
        throw new Error('Not impement');
    }

    async get(req) {
        // eslint-disable-next-line radix
        return this.Model.getInstance(parseInt(req.params.id));
    }

    async modify(optics) {
        throw new Error('Not impement');
    }

    async destroy(id) {
        throw new Error('Not impement');
    }
}
