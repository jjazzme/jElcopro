import ApiRouter from './ApiRouter';
import ProducerController from '../controller/ProducerController';
import ApiController from '../controller/ApiController';
import UserController from '../controller/UserController';
import CurrencyRateController from '../controller/CurrencyRateController';
import PriceController from '../controller/PriceController';
import InvoiceController from '../controller/InvoiceController';
import ShellController from '../controller/ShellController';
import OrderController from '../controller/OrderController';
import GoodController from '../controller/GoodController';
import DocumentLineController from '../controller/DocumentLineController';
import ProductController from '../controller/ProductController';
import TransitionController from '../controller/TransitionController';
import ModelController from '../controller/ModelController';
import ProcedureController from '../controller/ProcedureController';
import TransferInController from "../controller/TransferInController";
import TransferOutController from "../controller/TransferOutController";
import TransferOutCorrectiveController from "../controller/TransferOutCorrectiveController";
import TransferInCorrectiveController from "../controller/TransferInCorrectiveController";
import DadataController from "../controller/DadataController";
import AddressController from "../controller/AddressController";
import CompanyController from "../controller/CompanyController";

export default function ApiRoutes(services) {
    const apiRouter = new ApiRouter(services.db);

    apiRouter.resource('dadata', DadataController);

    apiRouter.middleware(services.auth.bearer); // before without

    apiRouter.resource('address', AddressController);
    apiRouter.resource('company', CompanyController);
    apiRouter.resource('currency', new ApiController(services.db.models.Currency));
    apiRouter.resource('currencyRateService', CurrencyRateController);
    apiRouter.resource('docline', DocumentLineController);
    apiRouter.resource('good', GoodController);
    apiRouter.resource('invoice', InvoiceController); // InvoiceController
    apiRouter.resource('model', new ModelController(services.db));
    apiRouter.resource('order', OrderController); // OrderController new ApiController(services.db.models.Order)
    apiRouter.resource('party', new ApiController(services.db.models.Party));
    apiRouter.resource('price', new PriceController(services));
    apiRouter.resource('producer', ProducerController);
    apiRouter.resource('product', ProductController);
    apiRouter.resource('procedure', new ProcedureController(services.db));
    apiRouter.resource('shell', ShellController);
    apiRouter.resource('store', new ApiController(services.db.models.Store));
    apiRouter.resource('transferIn', TransferInController);
    apiRouter.resource('transferOut', TransferOutController);
    apiRouter.resource('transferInCorrective', TransferInCorrectiveController);
    apiRouter.resource('transferOutCorrective', TransferOutCorrectiveController);
    apiRouter.resource('transition', new TransitionController(services.db));
    apiRouter.resource('user', UserController);
    return apiRouter.router;
}
