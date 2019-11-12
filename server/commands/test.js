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
const { DocumentLine } = db;

module.exports.run = async (args) => {
    const service = new PromelecService();
    await service.apiSearchByName('tda2003v')
};