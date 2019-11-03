import StateMachine from 'javascript-state-machine';
import _ from 'lodash';
import Entity from './Entity';
import { DocumentLine } from '../models';

export default class DocumentService extends Entity {
    /**
     * Transitions used in children
     * @type {Array}
     * @private
     */
    _transitions = [];

    constructor(entity) {
        super(entity);
        this._includes = [{ model: DocumentLine, as: 'documentLines' }];
    }

    /**
     *  Document status transition
     * @param {string} name
     * @param {Object=} params
     * @returns {Promise<boolean>}
     */
    async transition(name, params) {
        if (this._instance) {
            StateMachine.apply(this._instance, {
                init: this._instance.status_id,
                transitions: this._transitions,
                methods: {
                    [`onBefore${_.upperFirst(name)}`]: () => this[name](params),
                },
            });
            if (this._instance.can(name)) {
                try {
                    console.log(`Try ${name}`);
                    await this._instance[name]();
                    console.log(this._instance.state);
                    this._instance.status = this._instance.state;
                    return true;
                } catch (e) {
                    console.log('reject', e);
                }
            }
        }
        return false;
    }
}
