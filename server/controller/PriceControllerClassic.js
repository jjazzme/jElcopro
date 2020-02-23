import ApiControllerClassic from './ApiControllerClassic';

export default class PriceController extends ApiControllerClassic {
    constructor(services) {
        super(services.db.models.Price);
        this.service = services.prices;
    }

    async index(req) {
        if (req.query.documentType !== 'offer') return super.index(req);
        const optics = JSON.parse(req.query.filters);
        return optics.from_store ? this.service.searchByNameOnStore(optics) : this.service.searchByName(optics);
    }
}
