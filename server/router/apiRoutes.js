import ApiRouter from './ApiRouter';
import ProducerController from '../controller/ProducerController';
import ApiController from '../controller/ApiController';
import UserController from '../controller/UserController';
import CurrencyRateController from '../controller/CurrencyRateController';
import PriceController from '../controller/PriceController';
import InvoiceController from '../controller/InvoiceController';
import ShellController from '../controller/ShellController';
import OrderController from '../controller/OrderController';
import GoodController from '../controller/GoodController';
import DocumentLineController from '../controller/DocumentLineController';
import ProductController from '../controller/ProductController';
import TransitionController from '../controller/TransitionController';
import ModelController from '../controller/ModelController';

export default function ApiRoutes(services) {
    const apiRouter = new ApiRouter(services.db);

    apiRouter.middleware(services.auth.bearer); // before without

    apiRouter.resource('currency', new ApiController(services.db.models.Currency));
    apiRouter.resource('currencyRateService', CurrencyRateController);
    apiRouter.resource('docline', DocumentLineController);
    apiRouter.resource('good', GoodController);
    apiRouter.resource('invoice', InvoiceController); // InvoiceController
    apiRouter.resource('order', OrderController); // OrderController new ApiController(services.db.models.Order)
    apiRouter.resource('party', new ApiController(services.db.models.Party));
    apiRouter.resource('price', new PriceController(services));
    apiRouter.resource('producer', ProducerController);
    apiRouter.resource('product', ProductController);
    apiRouter.resource('shell', ShellController);
    apiRouter.resource('store', new ApiController(services.db.models.Store));
    apiRouter.resource('transferIn', new ApiController(services.db.models.TransferIn));
    apiRouter.resource('transferOut', new ApiController(services.db.models.TransferOut));
    apiRouter.resource('user', UserController);
    apiRouter.resource('transition', new TransitionController(services.db));
    apiRouter.resource('model', new ModelController(services.db));
    return apiRouter.router;
}
