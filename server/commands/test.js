import InvoiceService from "../services/InvoiceService";
import PartyService from "../services/PartyService";
import PriceService from "../services/PriceService";


module.exports.run = async (args) => {
    const service = new PriceService();
    const res = await service.searchByName({ name: 'max232cpe' });
    console.log(res);
};