import BaseModel from './BaseModel';
import CloseTransitionMixin from './mixins/CloseTransitionMixin';

export default class Order extends CloseTransitionMixin(BaseModel) {
    transitions = [
        { name: 'toWork', from: 'formed', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'formed' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    /**
     * Transition 'toWork' for make order 'in_work' status
     * @param {Object} params
     * @returns {Promise<boolean>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _toWorkTransition(params) {
        return true;
    }

    /**
     * Transition 'unWork' for make order 'formed' status
     * @param {Object} params
     * @returns {Promise<boolean>}
     * @private
     */

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _unWorkTransition(params) {
        return true;
    }
}
