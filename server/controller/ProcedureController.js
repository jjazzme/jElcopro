import TransferOut from '../db/TransferOutModel';

export default class ProcedureController {
    constructor(db) {
        this.db = db;
    }

    async modify(req) {
        const method = req.params.id;
        const params = req.body;

        return this[method](params);
    }

    async Transition(params) {
        const Model = this.db.models[params.Model];
        const model = await Model.findByPk(parseInt(params.id, 0));
        await model.services.transition.execute(params.transition, model);
        return { [Model.name]: [model] };
    }

    async makeChildren(params) {
        const ans = await this.db.models[params.to].createFromOptics({ parent_id: params.id });
        return {
            [params.to]: [ans],
        };
    }
}
