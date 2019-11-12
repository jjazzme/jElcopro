'use strict';

import { Company, Party, Store } from '../models';
import ModelService from "./ModelService";

export default class StoreService extends ModelService {

    constructor() {
        super(Store);
        this._includes = [{ model: Company, as: 'company', required: true, include: [ { model: Party, as: 'party'} ] }];
    }

}
