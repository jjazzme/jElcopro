import BaseModel from './BaseModel';

export default class Good extends BaseModel {
    /**
     * Transfer FutureReserve in resereve if it possible
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async checkFutureReserve() {
        const { FutureReserve } = this.services.db.models;
        const futureReserves = await FutureReserve.scope({ method: ['withGood', this.id] }).findAll();
        // eslint-disable-next-line no-unused-vars
        for (const fr of futureReserves) {
        //    await this.reserve(fr.documentLine, { transaction });
        }
    }
}
