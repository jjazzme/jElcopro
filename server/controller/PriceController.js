export default class PriceController {
    constructor(services) {
        this.service = services.prices;
    }

    async index(req) {
        const { optics } = req.body;
        return optics.from_store ? this.service.searchByNameOnStore(optics) : this.service.searchByName(optics);
    }
}
