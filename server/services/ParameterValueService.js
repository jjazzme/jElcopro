import { ParameterValue, ParameterName } from '../models';
import Entity from './Entity';

export default class ParameterValueService extends Entity {
    constructor() {
        super(ParameterValue);
        this._includes = [
            { model: ParameterValue, as: 'rightParameterValue' },
            { model: ParameterName, as: 'parameterName' },
        ];
        this._right = 'rightParameterValue';
    }
}
