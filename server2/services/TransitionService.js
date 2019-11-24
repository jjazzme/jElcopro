import _ from 'lodash';
import StateMachine from 'javascript-state-machine';

export default class TransitionService {
    constructor(db) {
        this.db = db;
    }

    /**
     *  Document status transition
     * @param {string} name - transition name
     * @param {Object} instance
     * @param {Object=} params
     * @returns {Promise<*>}
     */
    async applay(name, instance, params) {
        // eslint-disable-next-line no-unused-vars
        return this.db.connection.transaction(async (t) => {
            if (!instance.status_id) throw new Error('Instance have not status_id');
            const obj = { instance };
            StateMachine.apply(obj, {
                init: instance.status_id,
                transitions: instance.transitions,
                methods: { [`onBefore${_.upperFirst(name)}`]: async () => instance[`_${name}Transition`](params) },
            });
            if (obj.can(name)) {
                await obj[name]();
                instance.status_id = obj.state;
                instance.save();
            } else {
                throw new Error(`${instance} transition ${name} is impossible for ${instance.status_id} status`);
            }
        });
    }
}
