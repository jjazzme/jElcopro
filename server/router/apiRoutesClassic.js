import ApiRouterClassic from './ApiRouterClassic';
import ApiController from '../controller/ApiControllerClassic';

export default function ApiRoutesClassic(services) {
    const apiRouter = new ApiRouterClassic(services.db);

    // apiRouter.middleware(services.auth.bearer);

    apiRouter.resource('producer', new ApiController(services.db.models.Producer));

    return apiRouter.router;
}
