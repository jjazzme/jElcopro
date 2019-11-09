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
    const t = await db.sequelize.transaction();
    const service = new ProducerService();
    const producer = await service.create({ name: 'TyTyT' }, t);
    console.log(producer);
    //const p = await db.Producer.findOne({ where: { id: 1061 }, transaction: t })
    //console.log(p);
    await t.rollback();

};