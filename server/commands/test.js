import PriceService from '../services/PriceService';
import InvoiceService from "../services/InvoiceService";
import { Invoice } from '../models';

module.exports.run = async (args) => {
    const service = await InvoiceService.getNew(1);
    await service.transition('reserve', { own: true });
    // console.log(service);
};