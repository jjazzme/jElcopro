import CompanyService from "../services/CompanyService";
import _ from "lodash";
import OrderService from "../services/OrderService";
import ProducerService from "../services/ProducerService";
import ProductService from "../services/ProductService";
import GoodService from "../services/GoodService";
import DocumentLineService from "../services/DocumentLineService";
import PriceService from "../services/PriceService";
import db from "../models";
const { DocumentLine } = db;

module.exports.run = async (args) => {
    const service = new PriceService();
    const res = await service.searchByName({ name: 'MAX232cpe', from_store: 2 });
    console.log(res);
};