import ApiController from './ApiController';

export default class DocumentController extends ApiController {
    scopes = [
        'withBuyerable',
        'withSellerable',
        'withStore',
        'withForeignStore',
        'withCurrency',
        'withDocumentLines',
    ];

    async get(req) {
        return this.Model.getInstance(parseInt(req.params.id, 0), this.scopes);
    }
}
