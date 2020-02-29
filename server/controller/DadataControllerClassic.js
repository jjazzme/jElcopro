import _ from 'lodash';
import ApiControllerClassic from './ApiControllerClassic';

export default class DadataControllerClassic extends ApiControllerClassic {
    constructor(services, type) {
        super(services.db.models[_.upperFirst(type)]);
        this.services = services;
        this.type = type;
    }

    async index(req) {
        const filters = JSON.parse(req.query.filters);
        const search = filters.name || filters.address;
        if (search.length < 3) return [];
        const key = `${this.type}_${search}`;
        if (await this.services.cache.has(key)) return this.services.cache.get(key);
        const data = await this.services.dadata.query(this.type, search);
        const answer = { rows: await Promise.all(data.suggestions.map((value) => this[this.type](value))) };
        return this.services.cache.put(key, answer, 1440);
    }
}
