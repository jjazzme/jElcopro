
import _ from 'lodash'
import ExternalPriceService from "../services/ExternalPriceService";
import PromelecService from "../services/PromelecService";
import axios from 'axios';

module.exports.run = async (args) => {
    //const service = await ExternalPriceService.forCompany(1);
    //const res = await service.searchById('665279');
    const service = new PromelecService();
    const res = await service.apiSearchByName('max232cpe');
    //const res = await axios.get('https://ya.ru');
    console.log(res);
};