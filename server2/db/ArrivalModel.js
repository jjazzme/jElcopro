import BaseModel from './BaseModel';

export default class Arrival extends BaseModel {
    static registerHooks() {
        /**
         * Increase good ballance & Check FutureReserve after arrival create
         */
        this.afterCreate(async (arrival) => {
            const lineFrom = await arrival.getDocumentLine({ scope: ['withGood'] });
            lineFrom.good.ballance += arrival.ballance;
            await lineFrom.good.save();
            await lineFrom.good.checkFutureReserve();
        });
        /**
         * Change good ballance;
         */
        this.beforeUpdate(async (arrival) => {
            const lineFrom = arrival.documentLine || await arrival.getDocumentLine({ scope: ['withGood'] });
            lineFrom.good.ballance += arrival.ballance - arrival.previous('ballance');
            await lineFrom.good.save();
            if (arrival.ballance > arrival.previous('ballance')) {
                await lineFrom.good.checkFutureReserve();
            }
        });
        /**
         * Decrease good ballance or Error before arrival destroy
         */
        this.beforeDestroy(async (arrival) => {
            const lineFrom = arrival.documentLine || await arrival.getDocumentLine({ scope: ['withGood'] });
            if (lineFrom.quantity !== arrival.ballance) throw new Error('Check reserves & departures');
            lineFrom.good.ballance -= arrival.ballance;
            if (lineFrom.good.ballance < 0) throw new Error('Impossible minus ballance');
            await lineFrom.good.save();
        });
        return this;
    }
}
