import _ from 'lodash';
import StateMachine from 'javascript-state-machine';

export default class TransitionService {
    constructor(db) {
        this.db = db;
    }

    /**
     *  Document status transition
     * @param {string} name - transition name
     * @param {Object} instance - document
     * @param {Object=} params
     * @returns {Promise<*>}
     */
    async execute(name, instance, params) {
        // eslint-disable-next-line no-unused-vars
        await this.db.connection.transaction(async () => {
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
        return true; // Заменить на возврат инстанса
    }
}
