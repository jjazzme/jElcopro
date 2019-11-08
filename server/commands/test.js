import CompanyService from "../services/CompanyService";
import _ from "lodash";
import OrderService from "../services/OrderService";
import ProducerService from "../services/ProducerService";
import ProductService from "../services/ProductService";
import GoodService from "../services/GoodService";
import DocumentLineService from "../services/DocumentLineService";

module.exports.run = async (args) => {
    const dan = await (new CompanyService()).getByAlias('dan');
    const danStore = _.find(dan.stores, { is_main: true });
    const elcopro = await (new CompanyService()).getByAlias('elcopro');
    const elcoproStore = _.find(elcopro.stores, { is_main: true });
    const order = await (new OrderService()).find({
        number: '1',
        user_id: 1,
        sellerable_id: dan.id,
        buyerable_id: elcopro.id,
        store_id: elcoproStore.id,
        foreign_store_id: danStore.id,
        number_prefix: 'TEST',
    });
    const producer = await (new ProducerService()).find({ name: 'TEST' });
    const product = await (new ProductService()).find({ name: 'TEST', producer_id: producer.id });
    const good = await (new GoodService()).find({ product_id: product.id, store_id: danStore.id });
    const rightGood = await (new GoodService()).find({ product_id: product.id, store_id: elcoproStore.id });
    const service = new DocumentLineService();
    const ret = await service.firstOrCreate({
        document_id: order.id,
        times: 10,
    }, {
        good_id: good.id,
        quantity: 10,
        vat: 20,
        price_without_vat: 10,
        price_with_vat: 12,
        amount_without_vat: 100,
        amount_with_vat: 120,
        store_id: danStore.id,
        remark: 'TEST',
    })
    console.log(ret);
};