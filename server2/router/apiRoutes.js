import ApiRouter from './ApiRouter';
import ProductController from '../controller/ProductController';
import ProducerController from '../controller/ProducerController';
import ApiController from '../controller/ApiController';

export default function ApiRoutes(db, auth) {
    const apiRouter = new ApiRouter(db);
    const testMiddleware = (req, res, next) => {
        console.log('MIDDLEWARE');
        next();
    };
    apiRouter.recource('product', ProductController, testMiddleware);
    apiRouter.recource('producer', ProducerController);
    apiRouter.recource('party', new ApiController(db.models.Party), auth.bearer);
    return apiRouter.router;
}
