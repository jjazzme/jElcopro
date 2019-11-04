import db from '../models/index';
import Entity from './Entity';

const { Good, Product, Store } = db;

export default class GoodService extends Entity {
    constructor() {
        super(Good);
        this._includes = [{ model: Product, as: 'product' }, { model: Store, as: 'store' }];
    }

    /**
     * Disactivate ended goods
     * @param {number} store_id
     * @param {Date} start
     * @returns {Promise<int>}
     */
    async disactivate(storeId, start) {
        const { Op } = db.Sequelize;
        const [numberOfAffectedRows] = await Good.update(
            { is_active: false, ballance: 0 },
            { where: { is_active: true, store_id: storeId, updatedAt: { [Op.lt]: start } } },
        );
        return numberOfAffectedRows;
    }
}
