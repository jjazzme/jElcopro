'use strict';

import { ParameterName, Unit } from '../models';
import Entity from "./Entity";

export default class ParameterNameService extends Entity {

    constructor() {
        super(ParameterName);
        this._includes = [{ model: Unit, as: 'baseUnit' }];
    }

    async getByAlias(alias) {
        return (await ParameterName.findOne({ where: { alias: alias } }));
    }

}