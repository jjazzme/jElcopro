'use strict';

import { Company, Party, Store } from '../models';
import Entity from "./Entity";

export default class StoreService extends Entity {

    constructor() {
        super(Store);
        this._includes = [{ model: Company, as: 'company', required: true, include: [ { model: Party, as: 'party'} ] }];
    }

}
