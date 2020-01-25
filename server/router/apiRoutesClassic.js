import ApiRouterClassic from './ApiRouterClassic';
// import ApiController from '../controller/ApiControllerClassic';
import ProducerControllerClassic from '../controller/ProducerControllerClassic';
import InvoiceControllerClassic from '../controller/InvoiceControllerClassic';
import OrderControllerClassic from '../controller/OrderControllerClassic';
import DocumentLineControllerClassic from '../controller/DocumentLineControllerClassic';
import TransitionControllerClassic from '../controller/TransitionControllerClassic';

export default function ApiRoutesClassic(services) {
    const apiRouter = new ApiRouterClassic(services.db);

    // apiRouter.middleware(services.auth.bearer);

    apiRouter.resource('producer', ProducerControllerClassic);
    apiRouter.resource('invoice', InvoiceControllerClassic);
    apiRouter.resource('order', OrderControllerClassic);
    apiRouter.resource('document-line', DocumentLineControllerClassic);
    apiRouter.resource('transitions', TransitionControllerClassic);
    return apiRouter.router;
}
