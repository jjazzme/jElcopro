import ApiRouter from './ApiRouter';
import ProductController from '../controller/ProductController';
import ProducerController from '../controller/ProducerController';
import ApiController from '../controller/ApiController';
import UserController from '../controller/UserController';

export default function ApiRoutes(db, auth) {
    const apiRouter = new ApiRouter(db);
    const testMiddleware = (req, res, next) => {
        console.log('MIDDLEWARE');
        next();
    };
    apiRouter.resource('product', ProductController, testMiddleware);
    apiRouter.resource('producer', ProducerController);
    apiRouter.resource('user', UserController, auth.bearer); //

    apiRouter.resource('party', new ApiController(db.models.Party), auth.bearer);
    return apiRouter.router;
}
