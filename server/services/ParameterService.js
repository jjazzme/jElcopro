'use strict';

import { Parameter, ParameterName, ParameterValue, Unit } from '../models';
import Entity from "./Entity";

export default class PrameterService extends Entity {

    constructor() {
        super(Parameter);
        this._includes = [
            { model: ParameterName, as: 'parameterName' },
            { model: ParameterValue, as: 'parameterValue' },
            { model: Unit, as: 'unit' }
        ]
    }
}