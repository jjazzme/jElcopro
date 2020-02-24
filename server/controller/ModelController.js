import _ from 'lodash';

export default class ModelController {
    constructor(db) {
        this.models = { rows: [] };
        const source = _.filter(db.models, (model) => model.associations.parent || model.associations.children);
        _.forEach(source, (model) => {
            this.models.rows
                .push(
                    {
                        id: model.name,
                        parent: model.associations.parent.target.name,
                        children: model.associations.children.target.name,
                    },
                );
        });
        this.db = db;
    }

    index() {
        return this.models;
    }
}

/*
        this.models = _.filter(db.models, (model) => model.associations.parent || model.associations.children)
            .map((model) => {
                const m = {};
                m.parent = model.associations.parent.target.name;
                m.children = model.associations.children.target.name;
                return { [model.name]: m };
            });
 */
