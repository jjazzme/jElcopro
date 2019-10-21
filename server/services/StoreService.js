'use strict';

import { Company, Store } from '../models';
import Entity from "./Entity";

export default class StoreService extends Entity {

    constructor() {
        super(Store);
        this._includes = [{ model: Company, required: true }];
    }

}
