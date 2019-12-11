import ApiRouter from './ApiRouter';
import ProductController from '../controller/ProductController';
import ProducerController from '../controller/ProducerController';
import ApiController from '../controller/ApiController';
import UserController from '../controller/UserController';
import CurrencyRateController from '../controller/CurrencyRateController';

export default function ApiRoutes(db, auth) {
    const apiRouter = new ApiRouter(db);
    apiRouter.resource('product', ProductController, auth.bearer);
    apiRouter.resource('producer', ProducerController, auth.bearer);
    apiRouter.resource('user', UserController, auth.bearer); //
    apiRouter.resource('store', new ApiController(db.models.Store), auth.bearer);
    apiRouter.resource('currency', new ApiController(db.models.Currency), auth.bearer);
    apiRouter.resource('currencyRateService', CurrencyRateController, auth.bearer);

    apiRouter.resource('party', new ApiController(db.models.Party), auth.bearer);
    return apiRouter.router;
}
