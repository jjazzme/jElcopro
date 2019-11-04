import PriceService from '../services/PriceService';
import InvoiceService from "../services/InvoiceService";
import { Invoice } from '../models';

module.exports.run = async (args) => {
    const service = await PriceService.getNew()
    const res = await service.searchByNameOnStore({ name: 'max232cpe', from_store: 1})
    console.log(res);
};