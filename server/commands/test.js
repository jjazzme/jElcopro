import OrderService from '../services/OrderService';
import DocumentLineService from '../services/DocumentLineService';
import InvoiceService from '../services/InvoiceService';
import TransferInService from '../services/TransferInService';
import TransferOutService from '../services/TransferOutService';
import CompelService from '../services/CompelService';
import PriceService from '../services/PriceService';

// eslint-disable-next-line no-unused-vars
module.exports.run = async (args) => {
    const service = new PriceService();
    const ret = await service.searchByNameOnStore({ name: 'DFRduino UNO R3', from_store: 1 });
    console.log(ret);
};
