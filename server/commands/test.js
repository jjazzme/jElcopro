
import _ from 'lodash'
import CompelService from "../services/CompelService";
import GoodService from "../services/GoodService";
import { Parameter } from "../models";
import ParameterService from "../services/ParameterService";

module.exports.run = async (args) => {
    const res = await CompelService.searchById('878762');//args.n);
    //const res = await CompelService.searchByName('max232cpe+');
    console.log(res);
};