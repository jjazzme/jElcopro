'use strict';

import { Good, Product, Store } from '../models';
import Entity from "./Entity";

export default class GoodService extends Entity {

    constructor() {
        super(Good);
        this._includes = [{ model: Product }, { model: Store }]
    }
}