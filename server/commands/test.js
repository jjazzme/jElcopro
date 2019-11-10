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
const { DocumentLine } = db;

module.exports.run = async (args) => {
    const service = new CompelService();
    await service.apiSearchByName('uno r3')
};