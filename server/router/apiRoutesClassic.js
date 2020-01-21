import ApiRouterClassic from './ApiRouterClassic';
import ApiController from '../controller/ApiController';

export default function ApiRoutesClassic(services) {
    const apiRouter = new ApiRouterClassic(services.db);

    // apiRouter.middleware(services.auth.bearer);

    apiRouter.resource('currency', new ApiController(services.db.models.Currency));

    return apiRouter.router;
}
