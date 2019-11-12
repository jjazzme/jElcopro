'use strict';

import { Unit } from '../models';
import ModelService from "./ModelService";

export default class UnitService extends ModelService {

    constructor() {
        super(Unit);
        this._includes = [{ model: Unit, as: 'baseUnit' }];
    }

}