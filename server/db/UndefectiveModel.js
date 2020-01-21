import Document from './DocumentModel';

export default class Undefective extends Document {
    transitions = [
        { name: 'toWork', from: 'formed', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'formed' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    // eslint-disable-next-line no-unused-vars
    async _toWorkTransition(params) {
        const { Arrival } = this.services.db.models;
        const lines = await this.getDocumentLines();
        const promises = lines.map((line) => Arrival.create({
            document_line_id: line.id,
            ballance: line.quantity,
        }));
        return Promise.all(promises);
    }

    // eslint-disable-next-line no-unused-vars
    async _unWorkTransition(params) {
        const lines = await this.getDocumentLines({ scope: ['withArrival'] });
        const promises = lines.map((line) => line.arrival.destroy());
        return Promise.all(promises);
    }

    static async createFromOptics(optics) {
        optics.sellerable_id = optics.buyerable_id;
        return super.createFromOptics(optics);
    }
}
