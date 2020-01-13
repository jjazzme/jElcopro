import _ from 'lodash';
import Document from './DocumentModel';

export default class Defective extends Document {
    transitions = [
        { name: 'toWork', from: 'formed', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'formed' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    // eslint-disable-next-line no-unused-vars
    async _toWorkTransition(params) {
        const { Departure, FutureReserve } = this.services.db.models;
        const documentLines = await this.getDocumentLines({ scope: ['withParent', 'withGood'] });
        // eslint-disable-next-line no-unused-vars
        for (const line of documentLines) {
            const index = ['transfer-in', 'transfer-in-corrective', 'undefective', 'movement-in']
                .indexOf(line.parent.document.document_type_id);
            if (index >= 0) {
                const arrival = await line.parent.getArrival();
                arrival.ballance -= line.quantity;
                if (arrival.ballance < 0) {
                    throw new Error(`Data changed, try new chance with ${line.good.product.name}`);
                }
                await Departure.create({ document_line_id: line.id, arrival_id: arrival.id });
                await arrival.save();
                await line.update({ closed: true, parent_id: null });
            } else {
                // Тут кривая логика когда случится ошибка нужно будет менять
                const reserves = await line.parent.getReserves({ scope: ['withDocumentLine'] });
                const reserve = _.find(reserves, (o) => o.quantity >= line.quantity);
                if (!reserve) throw new Error(`Check resereves for ${line.good.product.name}`);
                reserve.quantity -= line.quantity;
                const futureReserve = await reserve.documentLine.getFutureReserve();
                if (futureReserve) {
                    futureReserve.ballance += line.quantity;
                    await futureReserve.save();
                } else {
                    await FutureReserve.create({
                        document_line_id: reserve.document_line_id,
                        ballance: line.quantity,
                    });
                }
                await Departure.create({ document_line_id: line.id, arrival_id: reserve.arrival_id });
                if (reserve.quantity === 0) await reserve.destroy();
                else await reserve.save();
                await line.update({ closed: true, parent_id: null });
            }
        }
        return true;
    }

    // eslint-disable-next-line no-unused-vars
    async _unWorkTransition(params) {
        await this.update({ status_id: 'formed' });
        const { FutureReserve, DocumentLine } = this.services.db.models;
        const documentLines = await this.getDocumentLines({ scope: ['withDeparture'] });
        // eslint-disable-next-line no-unused-vars
        for (const line of documentLines) {
            const arrival = await line.departure.getArrival();
            arrival.ballance += line.quantity;
            await line.departure.destroy();
            const count = await FutureReserve
                .count({ include: [{ model: DocumentLine, as: 'documentLine', where: { good_id: line.good_id } }] });
            await line.update({ closed: false, parent_id: arrival.document_line_id });
            if (count > 0) await line.destroy();
            await arrival.save();
        }
        return true;
    }

    static async createFromOptics(optics) {
        optics.buyerable_id = optics.sellerable_id;
        return super.createFromOptics(optics);
    }
}
