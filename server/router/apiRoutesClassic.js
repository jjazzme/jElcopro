import ApiRouterClassic from './ApiRouterClassic';
// import ApiController from '../controller/ApiControllerClassic';
import ProducerControllerClassic from '../controller/ProducerControllerClassic';
import InvoiceControllerClassic from '../controller/InvoiceControllerClassic';

export default function ApiRoutesClassic(services) {
    const apiRouter = new ApiRouterClassic(services.db);

    // apiRouter.middleware(services.auth.bearer);

    apiRouter.resource('producer', ProducerControllerClassic);
    apiRouter.resource('invoice', InvoiceControllerClassic);
    return apiRouter.router;
}
