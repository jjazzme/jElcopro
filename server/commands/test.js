
import _ from 'lodash'
import ExternalPriceService from "../services/ExternalPriceService";
import PromelecService from "../services/PromelecService";
import axios from 'axios';
import PriceService from "../services/PriceService";

module.exports.run = async (args) => {
    const service = new PriceService();
    const res = await service.searchByNameOnStore( 'MAX232CP', 3);
    //const service = await ExternalPriceService.forCompany('promelec');
    //const res = await service.searchByName('LM2903MX');
    //const service = new PromelecService();
    //const res = await service.apiSearchByName('max232cpe');
    //const res = await axios.get('https://ya.ru');
    console.log(res);
};