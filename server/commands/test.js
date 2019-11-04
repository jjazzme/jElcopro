import PriceService from '../services/PriceService';
import InvoiceService from "../services/InvoiceService";
import { Invoice } from '../models';

module.exports.run = async (args) => {
    const service = await PriceService.getNew()
    const res = await service.searchByNameOnStore({ name: 'max232', from_store: 3})
    console.log(res);
};