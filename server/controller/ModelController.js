import _ from 'lodash';

export default class ModelController {
    constructor(db) {
        this.models = _.filter(db.models, (model) => model.associations.parent || model.associations.children)
            .map((model) => {
                const m = {};
                m.parent = model.associations.parent.target.name;
                m.children = model.associations.children.target.name;
                return { [model.name]: m };
            });
        this.db = db;
    }

    index() {
        return this.models;
    }
}
