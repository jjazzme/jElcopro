export default class ApiContollerClassic {
    constructor(Model) {
        this.Model = Model;
    }

    async index(req) {
        const {
            page, itemsPerPage, sortBy, sortDesc,
        } = req.query;
        let limit;
        if (!itemsPerPage) limit = 15;
        else if (itemsPerPage === '-1') limit = 0;
        else limit = parseInt(itemsPerPage, 0);
        const offset = (page - 1) * limit;
        const order = !sortBy ? [] : sortBy.map((sort, i) => ([sort, sortDesc[i] === 'false' ? 'ASC' : 'DESC']));
        return this.Model.findAndCountAll({ order, offset, limit });
    }

    async get(req) {
        return this.Model.getInstance(parseInt(req.params.id, 0), this.scopes || []);
    }

    async create(req) {
        const { id } = await this.Model.create(req.body);
        return this.Model.getInstance(id, this.scopes || []);
    }

    async update(req) {
        const id = parseInt(req.params.id, 0);
        await this.Model.update(req.body, { where: { id } });
        return this.Model.getInstance(id, this.scopes || []);
    }

    // eslint-disable-next-line class-methods-use-this
    async destroy() {
        return new Error('Not impement');
    }
}
