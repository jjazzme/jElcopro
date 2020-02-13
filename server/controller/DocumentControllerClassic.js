import ApiController from './ApiControllerClassic';

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
        'withChildren',
        'withParent',
    ];
}
