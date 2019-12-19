import _ from 'lodash';
import Document from './DocumentModel';

export default class Undefective extends Document {
    transitions = [
        { name: 'toWork', from: 'formed', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'formed' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    // eslint-disable-next-line no-unused-vars
    async _toWorkTransition(params) {
        return true;
    }

    // eslint-disable-next-line no-unused-vars
    async _unWorkTransition(params) {
        return true;
    }

    static async createFromOptics(optics) {
        optics.sellerable_id = optics.buyerable_id;
        return super.createFromOptics(optics);
    }
}
