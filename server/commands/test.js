import CompanyService from "../services/CompanyService";
import _ from "lodash";
import OrderService from "../services/OrderService";
import ProducerService from "../services/ProducerService";
import ProductService from "../services/ProductService";
import GoodService from "../services/GoodService";
import DocumentLineService from "../services/DocumentLineService";
import PriceService from "../services/PriceService";

module.exports.run = async (args) => {
    const service = new PriceService();
    const ret = await service.searchByNameOnStore({ name: 'uno r3', from_store: 3 });
    console.log(ret);
};