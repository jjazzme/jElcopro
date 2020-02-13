import _ from 'lodash';

export default class TransitionController {
    constructor(db) {
        this.transitions = _.filter(db.models, (model) => model.transitions)
            .map((model) => ({ [model.name]: model.transitions }));
        this.db = db;
    }

    index() {
        return this.transitions;
    }

    async modify(req) {
        const Model = this.db.models[req.body.Model];
        const model = await Model.findByPk(parseInt(req.params.id, 0));
        await model.services.transition.execute(req.body.transition, model);
        return { [Model.name]: [model.id] };
    }
}
