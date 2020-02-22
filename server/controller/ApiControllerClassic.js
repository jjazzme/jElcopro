import _ from 'lodash';
import { Op, literal } from 'sequelize';

export default class ApiContollerClassic {
    constructor(Model) {
        this.Model = Model;
    }

    async index(req) {
        const {
            page, itemsPerPage, sortBy, sortDesc, filters, filterActions, scopes,
        } = req.query;
        const actions = filterActions ? JSON.parse(filterActions) : {};
        const fullScopes = scopes || [];
        fullScopes.push('defaultScope');
        let limit;
        if (!itemsPerPage) limit = 15;
        else if (itemsPerPage === '-1') limit = null;
        else limit = parseInt(itemsPerPage, 0);
        const offset = page ? (page - 1) * limit : 0;
        const order = !sortBy ? [] : sortBy.map((sort, i) => (
            sort.indexOf('.') < 0
                ? [sort, sortDesc[i] === 'false' ? 'ASC' : 'DESC']
                : [literal(`${sort} ${sortDesc[i] === 'false' ? 'ASC' : 'DESC'}`)]
        ));
        const where = {};
        if (filters) {
            _.each(JSON.parse(filters), (value, key) => {
                if (value !== '' && (!_.isArray(value) || (_.isArray(value) && !_.isEmpty(value)))) {
                    if (actions[key]) {
                        const k = key.indexOf('.') < 0 ? key : `$${key}$`;
                        where[k] = { [Op[actions[key]]]: value };
                    } else {
                        where[key] = value;
                    }
                }
            });
        }
        return this.Model.scope(fullScopes).findAndCountAll({
            where, order, offset, limit,
        });
    }

    async get(req) {
        return this.Model.getInstance(parseInt(req.params.id, 0), this.scopes || []);
    }

    async create(req) {
        const payload = _.omit(req.body, ['id']);
        // need use req as request in options
        const user = await this.Model.services.db.models.User.findByPk(1);
        const model = await this.Model.create(payload, { user });
        return this.Model.getInstance(model, this.scopes || []);
    }

    async update(req) {
        const id = parseInt(req.params.id, 0);
        const model = await this.Model.findByPk(id);
        await model.update(req.body);
        return this.Model.getInstance(id, this.scopes || []);
    }

    async destroy(req) {
        // need use req as request in options
        const user = await this.Model.services.db.models.User.findByPk(1);
        const model = await this.Model.findByPk(req.params.id);
        return model.destroy({ user });
    }
}
