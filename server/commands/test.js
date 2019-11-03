import PriceService from '../services/PriceService';


module.exports.run = async (args) => {
    const service = await PriceService.getNew();
    // console.log(service);
    const res = await service.searchByNameOnStore({ name: 'tda2003', from_store: 1 });
    console.log(res);
};