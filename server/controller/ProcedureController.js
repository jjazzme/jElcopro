import { Op } from 'sequelize';
// import {where} from "sequelize";
// import TransferOut from '../db/TransferOutModel';

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

    async companySearch(params) {
        const { type, query } = params;

        const Model = this.db.models.Company;
        const dbAnswer = await Model.scope(['withStores', 'withAddress', 'defaultScope']).findAll({
            include: [
                {
                    model: this.db.models.Party,
                    as: 'party',
                    where: {
                        [Op.or]: [
                            { name: { [Op.like]: `%${query}%` } },
                            { inn: { [Op.like]: `%${query}%` } },
                        ],
                    },
                },
                { model: this.db.models.Store, as: 'stores' },
            ],
            limit: 5,
        });

        const { dadata } = Model.services;
        const dadataAnswer = await dadata.query(type, query);
        return { _dadata: dadataAnswer.suggestions, _db: dbAnswer };
    }
}
