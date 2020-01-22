import TransferOut from './TransferOutModel';

const transitions = [
    { name: 'toWork', from: 'formed', to: 'in_work' },
    { name: 'unWork', from: 'in_work', to: 'formed' },
    { name: 'close', from: 'in_work', to: 'closed' },
];

export default class MovementOut extends TransferOut {
    transitions = transitions;

    static transitions = transitions;

    /**
     * Create TransferIn from Order with lines
     * @param {Object} optics
     * @returns {Promise<BaseModel|null>}
     */
    static async createFromOptics(optics) {
        const { Movement } = this.services.db.models;
        return this.createFromParent(Movement, 'createTransferOutLines', optics);
    }
}
