import app from '../index'

export default class DadataController {
    constructor() {
    }

    async get(req) {
        const { dadata } = app.services;
        const type = req.params.id;
        const query = req.query.search;
        return await dadata.query(type, query);
    }

}
