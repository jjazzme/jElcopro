import ApiRouter from './ApiRouter';
import ProductController from '../controller/ProductController';
import ProducerController from '../controller/ProducerController';
import ApiController from '../controller/ApiController';
import UserController from '../controller/UserController';
import CurrencyRateController from '../controller/CurrencyRateController';

export default function ApiRoutes(db, auth) {
    const apiRouter = new ApiRouter(db);
    apiRouter.middleware(auth.bearer);
    apiRouter.resource('product', ProductController);
    apiRouter.resource('producer', ProducerController);
    apiRouter.resource('user', UserController); //
    apiRouter.resource('store', new ApiController(db.models.Store));
    apiRouter.resource('currency', new ApiController(db.models.Currency));
    apiRouter.resource('currencyRateService', CurrencyRateController);
    apiRouter.resource('party', new ApiController(db.models.Party));
    return apiRouter.router;
}
