import OrderService from '../services/OrderService';
import DocumentLineService from '../services/DocumentLineService';
import InvoiceService from '../services/InvoiceService';
import TransferInService from '../services/TransferInService';
import TransferOutService from '../services/TransferOutService';
import CompelService from '../services/CompelService';
import PriceService from '../services/PriceService';
import Cache from '../services/Cache';
import CompanyService from '../services/CompanyService';
import ExternalPriceService from '../services/ExternalPriceService';

// eslint-disable-next-line no-unused-vars
module.exports.run = async (args) => {
    //let res = await Cache.hasKey('company_compel');
    //console.log(res);
    //res = await Cache.valueByKey('company_compel');
    //console.log(res);
    const compel = await (new CompanyService()).getByAlias('compel');
    const service = await ExternalPriceService.forCompany(compel);
    const res = await service.searchByName('TDA2003L-TB5-T');
    console.log(res);
};
