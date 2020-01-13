import ApiRouter from './ApiRouter';
import ProductController from '../controller/ProductController';
import ProducerController from '../controller/ProducerController';
import ApiController from '../controller/ApiController';
import UserController from '../controller/UserController';
import CurrencyRateController from '../controller/CurrencyRateController';
import PriceController from '../controller/PriceController';
import InvoiceController from '../controller/InvoiceController';
import ShellController from '../controller/ShellController';
import OrderController from '../controller/OrderController';
import GoodController from '../controller/GoodController';

export default function ApiRoutes(services) {
    const apiRouter = new ApiRouter(services.db);

    apiRouter.middleware(services.auth.bearer); // before without

    apiRouter.resource('currency', new ApiController(services.db.models.Currency));
    apiRouter.resource('currencyRateService', CurrencyRateController);
    apiRouter.resource('good', GoodController);
    // new ApiController(services.db.models.Good) !!!
    // TODO: динамический импорт или статический типа () => import()?
    // TODO: не может применить дефолтные скопы тут: {"name":"SequelizeScopeError","message":"Invalid scope withBuyerable called."}
    apiRouter.resource('invoice', InvoiceController); // InvoiceController
    apiRouter.resource('order', OrderController); // OrderController new ApiController(services.db.models.Order)
    apiRouter.resource('party', new ApiController(services.db.models.Party));
    apiRouter.resource('price', new PriceController(services));
    apiRouter.resource('producer', ProducerController);
    apiRouter.resource('product', new ApiController(services.db.models.Product));
    apiRouter.resource('shell', ShellController);
    apiRouter.resource('store', new ApiController(services.db.models.Store));
    apiRouter.resource('transferIn', new ApiController(services.db.models.TransferIn));
    apiRouter.resource('transferOut', new ApiController(services.db.models.TransferOut));
    apiRouter.resource('user', UserController); //
    return apiRouter.router;
}
