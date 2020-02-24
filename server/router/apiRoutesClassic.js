import ApiRouterClassic from './ApiRouterClassic';
import ApiController from '../controller/ApiControllerClassic';
import ProducerControllerClassic from '../controller/ProducerControllerClassic';
import InvoiceControllerClassic from '../controller/InvoiceControllerClassic';
import OrderControllerClassic from '../controller/OrderControllerClassic';
import DocumentLineControllerClassic from '../controller/DocumentLineControllerClassic';
import TransitionControllerClassic from '../controller/TransitionControllerClassic';
import TransferInControllerClassic from '../controller/TransferInControllerClassic';
import TransferOutControllerClassic from '../controller/TransferOutControllerClassic';
import ProductControllerClassic from '../controller/ProductControllerClassic';
import GoodControllerClassic from '../controller/GoodControllerClassic';
import PriceControllerClassic from '../controller/PriceControllerClassic';
import CurrencyRateController from '../controller/CurrencyRateControllerClassic';
import UserControllerClassic from '../controller/UserControllerClassic';
import PartyControllerClassic from '../controller/PartyControllerClassic';

export default function ApiRoutesClassic(services) {
    const apiRouter = new ApiRouterClassic(services.db);

    // apiRouter.middleware(services.auth.bearer);

    apiRouter.resource('producer', ProducerControllerClassic);
    apiRouter.resource('product', ProductControllerClassic);
    apiRouter.resource('good', GoodControllerClassic);
    apiRouter.resource('invoice', InvoiceControllerClassic);
    apiRouter.resource('order', OrderControllerClassic);
    apiRouter.resource('document-line', DocumentLineControllerClassic);
    apiRouter.resource('transitions', TransitionControllerClassic);
    apiRouter.resource('document-type', new ApiController(services.db.models.DocumentType));
    apiRouter.resource('company', new ApiController(services.db.models.Company));
    apiRouter.resource('store', new ApiController(services.db.models.Store));
    apiRouter.resource('party', new PartyControllerClassic(services));
    apiRouter.resource('currency', new ApiController(services.db.models.Currency));
    apiRouter.resource('currency-rate', CurrencyRateController);
    apiRouter.resource('transfer-in', TransferInControllerClassic);
    apiRouter.resource('transfer-out', TransferOutControllerClassic);
    apiRouter.resource('price', new PriceControllerClassic(services));
    apiRouter.resource('user', UserControllerClassic);
    return apiRouter.router;
}
