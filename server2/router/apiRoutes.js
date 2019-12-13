import ApiRouter from './ApiRouter';
import ProductController from '../controller/ProductController';
import ProducerController from '../controller/ProducerController';
import ApiController from '../controller/ApiController';
import UserController from '../controller/UserController';
import CurrencyRateController from '../controller/CurrencyRateController';
import PriceController from '../controller/PriceController';

export default function ApiRoutes(services) {
    const apiRouter = new ApiRouter(services.db);
    apiRouter.middleware(services.auth.bearer);
    apiRouter.resource('product', ProductController);
    apiRouter.resource('producer', ProducerController);
    apiRouter.resource('user', UserController); //
    apiRouter.resource('store', new ApiController(services.db.models.Store));
    apiRouter.resource('currency', new ApiController(services.db.models.Currency));
    apiRouter.resource('currencyRateService', CurrencyRateController);
    apiRouter.resource('party', new ApiController(services.db.models.Party));
    apiRouter.resource('price', new PriceController(services));
    return apiRouter.router;
}
