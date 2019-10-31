
import _ from 'lodash'
import ExternalPriceService from "../services/ExternalPriceService";
import PromelecService from "../services/PromelecService";
import axios from 'axios';
import PriceService from "../services/PriceService";
import PartyService from "../services/PartyService";

module.exports.run = async (args) => {
    const service = new PartyService();
    const res = await service.fromDadata('7701129809');
    //const service = await ExternalPriceService.forCompany('promelec');
    //const res = await service.searchByName('LM2903MX');
    //const service = new PromelecService();
    //const res = await service.apiSearchByName('max232cpe');
    //const res = await axios.get('https://ya.ru');
    console.log(res);
};