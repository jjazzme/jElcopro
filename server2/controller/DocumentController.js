import ApiController from './ApiController';

export default class DocumentController extends ApiController {
    scopes = [
        'withSum',
        'withBuyerable',
        'withSellerable',
        'withStore',
        'withForeignStore',
        'withCurrency',
        'withDocumentLines',
        'withUser',
        'defaultScope',
    ];
}
