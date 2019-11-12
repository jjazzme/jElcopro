'use strict';

import { Parameter, ParameterName, ParameterValue, Unit } from '../models';
import ModelService from "./ModelService";

export default class PrameterService extends ModelService {

    constructor() {
        super(Parameter);
        this._includes = [
            { model: ParameterName, as: 'parameterName' },
            { model: ParameterValue, as: 'parameterValue' },
            { model: Unit, as: 'unit' }
        ]
    }
}