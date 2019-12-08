import { Op } from 'sequelize';
import BaseModel from './BaseModel';

export default class Good extends BaseModel {
    /**
     * Transfer FutureReserve in resereve if it possible
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async checkFutureReserve() {
        const { FutureReserve } = this.services.db.models;
        const futureReserves = await FutureReserve.scope({ method: ['withGood', this] }).findAll();
        // eslint-disable-next-line no-unused-vars
        for (const fr of futureReserves) {
            await fr.documentLine.reserve();
        }
    }

    /**
     * Disactivate ended goods
     * @param {number} storeId
     * @param {Date} start
     * @returns {Promise<int>}
     */
    static async disactivate(storeId, start) {
        const [numberOfAffectedRows] = await this.update(
            { is_active: false, ballance: 0 },
            { where: { is_active: true, store_id: storeId, updatedAt: { [Op.lt]: start } } },
        );
        return numberOfAffectedRows;
    }
}
