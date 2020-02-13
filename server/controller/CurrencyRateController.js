import ApiController from './ApiController';

export default class CurrencyRateController extends ApiController {
    constructor(db) {
        super(db.models.CurrencyRate);
        this.service = db.models.CurrencyRate.services.currencies;
    }

    async index(req) {
        return this.service.getRatesByDate(req.body.date);
    }
}
