'use strict';

import { Unit } from '../models';
import Entity from "./Entity";

export default class UnitService extends Entity {

    constructor() {
        super(Unit);
        this._includes = [{ model: Unit, as: 'baseUnit' }];
    }

}