import _ from 'lodash';
import { Op } from 'sequelize';
import Document from './DocumentModel';

export default class TransferOutCorrective extends Document {
    transitions = [
        { name: 'reserve', from: 'formed', to: 'reserved' },
        { name: 'unreserve', from: 'reserved', to: 'formed' },
        { name: 'toWork', from: 'reserved', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'reserved' },
        { name: 'closeReserves', from: 'in_work', to: 'in_work' },
    ];

    /**
     * Create
     * @param {Object} optics
     * @returns {Promise<BaseModel|null>}
     */
    static async createFromOptics(optics) {
        if (!optics.parentLines) throw new Error('Need select some parent lines');
        const { TransferIn } = this.services.db.models;
        return this.createFromParent(TransferIn, 'createTransferCorrectiveLines', optics);
    }

    // eslint-disable-next-line no-unused-vars
    async _toWorkTransition(params) {
        const { Departure, Reserve } = this.services.db.models;
        const documentLines = await this.getDocumentLines({ scope: ['withReserves'] });
        const checkReserves = documentLines
            .reduce((check, line) => check && line.reserves && line.reserves.length === 1, true);
        if (!checkReserves) throw Error('Every line has one resereve');
        const reserves = _.flatten(documentLines.map((line) => line.reserves));
        let promises = documentLines.map((line) => line.update({ closed: true }));
        promises = _.union(promises, reserves.map((reserve) => Departure.create({
            document_line_id: reserve.document_line_id,
            arrival_id: reserve.arrival_id,
        })));
        promises.push(Reserve.destroy({ where: { id: { [Op.in]: reserves.map((r) => r.id) } } }));
        return Promise.all(promises);
    }

    // eslint-disable-next-line no-unused-vars
    async _unWorkTransition(params) {
        await this.parentToBeOpen();
        const { Departure, Reserve } = this.services.db.models;
        const documentLines = await this.getDocumentLines({ scope: ['withDeparture'] });
        let promises = documentLines.map((line) => line.update({ closed: false }));
        promises = _.union(promises, documentLines.map((line) => Reserve.create({
            document_line_id: line.id,
            arrival_id: line.departure.arrival_id,
            quantity: line.quantity,
            closed: false,
        })));
        promises.push(Departure.destroy(
            { where: { id: { [Op.in]: documentLines.map((line) => line.departure.id) } } },
        ));
        return Promise.all(promises);
    }
}
