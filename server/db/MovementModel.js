import Document from './DocumentModel';

const transitions = [
    { name: 'reserve', from: 'formed', to: 'reserved' },
    { name: 'unreserve', from: 'reserved', to: 'formed' },
    { name: 'toWork', from: 'reserved', to: 'in_work' },
    { name: 'unWork', from: 'in_work', to: 'reserved' },
    { name: 'closeReserves', from: 'in_work', to: 'in_work' },
    { name: 'openReserves', from: 'in_work', to: 'in_work' },
    { name: 'close', from: 'in_work', to: 'closed' },
];

export default class Movement extends Document {
    transitions = transitions;

    static transitions = transitions;

    static async createFromOptics(optics) {
        if (optics.buyerable_id !== optics.sellerable_id) throw new Error('Different contragents');
        return super.createFromOptics(optics);
    }
}
