import { ParameterValue, ParameterName } from '../models';
import ModelService from './ModelService';

export default class ParameterValueService extends ModelService {
    constructor() {
        super(ParameterValue);
        this._includes = [
            { model: ParameterValue, as: 'rightParameterValue' },
            { model: ParameterName, as: 'parameterName' },
        ];
        this._right = 'rightParameterValue';
    }
}
