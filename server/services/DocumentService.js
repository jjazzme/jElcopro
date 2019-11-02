import StateMachine from 'javascript-state-machine';
import _ from 'lodash';
import Entity from './Entity';

export default class DocumentService extends Entity {
    /**
     * Transitions used in children
     * @type {Array}
     * @private
     */
    _transitions = [];

    /**
     *  Document instance
     */
    _instance;

    constructor(entity) {
        super(entity);
        this._instance = null;
    }

    /**
     *  Document status transition
     * @param name
     * @returns {Promise<boolean>}
     */
    async transition(name) {
        if (this._instance) {
            StateMachine.apply(this._instance, {
                init: this._instance.status_id,
                transitions: this._transitions,
                methods: {
                    [`onBefore${_.upperFirst(name)}`]: () => this[name](),
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

    /**
     * Set Instance property
     * @param instance
     * @returns {Promise<void>}
     */
    async setInstance(instance) {
        this._instance = await this.getInstance(instance);
    }
}
