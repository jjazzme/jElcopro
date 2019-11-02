
import _ from 'lodash'
import ExternalPriceService from "../services/ExternalPriceService";
import PromelecService from "../services/PromelecService";
import axios from 'axios';
import PriceService from "../services/PriceService";
import PartyService from "../services/PartyService";
import CompanyService from "../services/CompanyService";
import Entity from "../services/Entity";
import ProductService from "../services/ProductService";

module.exports.run = async (args) => {
    const service = new ProductService();
    const res = await service.find({name: 'max232cpe'});
    //const service = await ExternalPriceService.forCompany('promelec');
    //const res = await service.searchByName('LM2903MX');
    //const service = new PromelecService();
    //const res = await service.apiSearchByName('max232cpe');
    //const res = await axios.get('https://ya.ru');
    console.log(res);
};