import ApiControllerClassic from './ApiControllerClassic';

export default class PriceController extends ApiControllerClassic {
    constructor(services) {
        super(services.db.models.Price);
        this.service = services.prices;
    }

    async index(req) {
        if (!req.query.filters.offer) return super.index(req);
        const optics = req.query;
        return optics.from_store ? this.service.searchByNameOnStore(optics) : this.service.searchByName(optics);
    }
}
