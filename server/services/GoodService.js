'use strict';

import { Good, Product, Store } from '../models';
import Entity from "./Entity";

import db from '../models/index';
const Op = db.Sequelize.Op;

export default class GoodService extends Entity {

    constructor() {
        super(Good);
        this._includes = [{ model: Product, as: 'product' }, { model: Store, as: 'store' }]
    }

    /**
     * Disactivate ended goods
     * @param store_id
     * @param start
     * @returns {Promise<int>}
     */
    async disactivate(store_id, start)
    {
        const [ numberOfAffectedRows ] = await Good.update(
            { is_active:  false, ballance: 0 },
            { where: { is_active: true, store_id: store_id, updatedAt: { [Op.lt]: start }  } }
        );
        return numberOfAffectedRows;
    }
}