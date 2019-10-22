'use strict';

import Entity from './Entity';

import { Currency, Price } from '../models';

export default class PriceService extends Entity {

    constructor() {
        super(Price);
        this._includes = [{ model: Currency, as: 'currency' }]
    }
};