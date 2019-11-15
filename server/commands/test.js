import CompanyService from "../services/CompanyService";
import _ from "lodash";
import OrderService from "../services/OrderService";
import ProducerService from "../services/ProducerService";
import ProductService from "../services/ProductService";
import GoodService from "../services/GoodService";
import DocumentLineService from "../services/DocumentLineService";
import PriceService from "../services/PriceService";
import db from "../models";
import CompelService from "../services/CompelService";
import PromelecService from "../services/PromelecService";
import InvoiceService from '../services/InvoiceService';
const { DocumentLine } = db;

module.exports.run = async (args) => {
    const promelec = await (new CompanyService()).getByAlias('promelec');
    const promelecStore = _.find(promelec.stores, { is_main: true });
    const producer = await (new ProducerService()).find({ name: 'TEST' });
    const product = await (new ProductService()).find({ name: 'TEST', producer_id: producer.id });
    const elcopro = await (new CompanyService()).getByAlias('elcopro');
    const elcoproStore = _.find(elcopro.stores, { is_main: true });
    const service = new InvoiceService();
    const invoice = await service.find({
        number: '1',
        user_id: 1,
        sellerable_id: elcopro.id,
        buyerable_id: promelec.id,
        store_id: elcoproStore.id,
        foreign_store_id: promelecStore.id,
        number_prefix: 'TEST',
    });
    const good = await (new GoodService()).find({ product_id: product.id, store_id: elcoproStore.id });
    const documenLineService = new DocumentLineService();
    const res = await documenLineService.firstOrCreate({
        document_id: invoice.id,
        times: 10,
    }, {
        good_id: good.id,
        quantity: 4,
        vat: 20,
        price_without_vat: 20,
        price_with_vat: 24,
        amount_without_vat: 80,
        amount_with_vat: 96,
        store_id: elcoproStore.id,
        remark: 'TEST',
    });
};