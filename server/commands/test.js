import CompanyService from "../services/CompanyService";
import ProductService from "../services/ProductService";
import { Company } from '../models'
module.exports.run = async () => {
    const service = await new CompanyService();
    const s = await service.updateOrCreateOnInnOgrn('5256051148', '1045207058687');
    //const s = await service.update({ id:7, name: 'TEST3' , producer_id: undefined })
    console.log(s);

};