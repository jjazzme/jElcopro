'use strict';

import { ParameterName, Unit } from '../models';
import ModelService from "./ModelService";

export default class ParameterNameService extends ModelService {

    constructor() {
        super(ParameterName);
        this._includes = [{ model: Unit, as: 'baseUnit' }];
    }

    async getByAlias(alias) {
        return (await ParameterName.findOne({ where: { alias: alias } }));
    }

}