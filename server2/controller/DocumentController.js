import ApiController from './ApiController';

export default class DocumentController extends ApiController {
    scopes = [
        'withBuyerable',
        'withSellerable',
        'withStore',
        'withForeignStore',
        'withCurrency',
        'withDocumentLines',
        'defaultScope',
    ];
}
