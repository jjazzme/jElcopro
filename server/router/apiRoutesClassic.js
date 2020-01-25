import ApiRouterClassic from './ApiRouterClassic';
// import ApiController from '../controller/ApiControllerClassic';
import ProducerControllerClassic from '../controller/ProducerControllerClassic';

export default function ApiRoutesClassic(services) {
    const apiRouter = new ApiRouterClassic(services.db);

    // apiRouter.middleware(services.auth.bearer);

    apiRouter.resource('producer', ProducerControllerClassic);

    return apiRouter.router;
}
