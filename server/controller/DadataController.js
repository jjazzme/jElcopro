export default class DadataController {
    constructor(dadata) {
        this.dadata = dadata;
    }

    async get(req) {
        const type = req.params.id;
        const query = req.query.search;
        return this.dadata.query(type, query);
    }
}
