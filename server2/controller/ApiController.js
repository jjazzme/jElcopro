import _ from 'lodash';
import { Op, col } from 'sequelize';

export default class ModelContoller {
    constructor(Model) {
        this.Model = Model;
    }

    async index(req) {
        const { optics, params } = req.body;
        const  page  = optics.page ? optics.page : 1;
        const limit = !optics.limit
            ? 15
            : optics.limit < 0
                ? null
                : optics.limit;
        const offset = (page - 1) * limit;
        const scopes = params?.scopes ? params.scopes : [];


        /*
        const order = scopes.length === 0 ? null : [[col('id'), 'ASC']];
        const where = scopes.length === 0 ? null : {
            '$producer.name$': {[Op.in]: ['MAX', 'EKF']},
        };
         */

        let order, where;
        where = optics.where;

        const resp = await this.Model.scope(scopes).findAndCountAll({
            order,
            limit,
            offset,
            where,
        });
        const pages = Math.ceil(parseFloat(resp.count) / limit);
        // eslint-disable-next-line consistent-return
        return {
            rows: resp.rows,
            count: resp.count,
            offset,
            page,
            limit,
            pages,
            permissions: {}, // auth.getModelPermissions(type, resp.rows),
        };
    }

    async get(req) {
        return this.Model.getInstance(parseInt(req.params.id, 0), this.scopes || []);
    }

    async modify(req) {
        let id = parseInt(req.params.id, 0);
        if (id) {
            await this.Model.update(req.body, { where: { id } });
        } else {
            id = (await this.Model.create(req.body)).id;
        }
        return this.Model.getInstance(id, this.scopes || []);
    }

    // eslint-disable-next-line class-methods-use-this
    async destroy() {
        return new Error('Not impement');
    }

    async index1(req) {
        const { optics, params } = req.body;
        // const type = req.body.type || req.params.type;

        // const { params } = req.body;
        // const userID = req.user.id;
        const { auth } = this.Model.services;

        /*
        if (auth.controllerPermissionIsDenied({
            clientUserID: userID,
            model: type,
            requiredPermissons: [this.enums.authType.Read],
        })
        ) {
            res.status(401);
            return { message: 'Authentication error' };
        }
        */

        // Криво нужно переделать если не передан limit и page
        const { page } = optics;
        const limit = optics.limit === null
          ? 15
          : optics.limit < 0
            ? null
            : optics.limit;
        const offset = (page - 1) * limit;
        //const limit = offset + limit;

        _.forEach(params?.filters, (filterSet, field) => {
            _.forEach(filterSet, (filter) => {
                if (!optics.filters) optics.filters = {};
                if (!optics.filters[field]) optics.filters[field] = [];
                optics.filters[field].push(filter);
            });
        });

        const actualFilters = {};
        _.forEach(optics.filters, (row, name) => {
            _.forEach(row, (item) => {
                if (item.value) {
                    if (!actualFilters[name]) actualFilters[name] = [];
                    actualFilters[name].push({ type: item.type, value: item.value });
                }
            });
        });

        const includeGen = (obj) => {
            const ret = [];
            _.forEach(obj, (val, name) => {
                const top = {};
                let current = top;
                _.forEach(val.path.split('.'), (item, ind) => {
                    current.model = this.Model.services.db.loadedModels[item];
                    // eslint-disable-next-line no-nested-ternary
                    current.as = val.as
                      ? val.as.split('.')[ind]
                        ? val.as.split('.')[ind]
                        : _.camelCase(item)
                      : _.camelCase(item);
                    if (ind !== val.path.split('.').length - 1) {
                        current.include = [{}];
                        // eslint-disable-next-line prefer-destructuring
                        current = current.include[0];
                    } else {
                        const actual = _.cloneDeep(actualFilters[name]);
                        if (actual) {
                            if (actual.length > 0) {
                                const arrWhere = [];
                                _.forEach(actual, (filter) => {
                                    if (filter.type === 'search') {
                                        const whereItem = {};
                                        whereItem[val.column] = { [Op.like]: `%${filter.value}%` };
                                        arrWhere.push(whereItem);
                                    }
                                    if (filter.type === '=') {
                                        const whereItem = {};
                                        whereItem[val.column] = { [Op.eq]: filter.value };
                                        arrWhere.push(whereItem);
                                    }
                                });
                                current.where = arrWhere.length > 1 ? [{ [Op.and]: arrWhere }] : arrWhere[0];
                            }
                            delete actualFilters[name];
                        }
                    }
                });
                ret.push(top);
            });
            return ret;
        };
        const include = includeGen(params?.aliases);

        const arrWhereRoot = [];
        _.forEach(actualFilters, (actual, name) => {
            _.forEach(actual, (filter) => {
                if (filter.type === 'search') {
                    const whereItem = {};
                    whereItem[name] = { [Op.like]: `%${filter.value}%` };
                    arrWhereRoot.push(whereItem);
                }
                if (filter.type === '=') {
                    const whereItem = {};
                    whereItem[name] = { [Op.eq]: filter.value };
                    arrWhereRoot.push(whereItem);
                }
            });
        });

        // eslint-disable-next-line no-nested-ternary
        const where = arrWhereRoot.length === 0
          ? null : arrWhereRoot.length > 1 ? [{ [Op.and]: arrWhereRoot }] : arrWhereRoot[0];

        const order = [];
        let sorters = _.pickBy(optics.sorters, (item) => item.order !== null);
        sorters = _.map(sorters, (item, key) => ({ order: item.order, column: key, value: item.value }));
        sorters = _.orderBy(sorters, 'order', 'asc');
        _.forEach(sorters, (item) => {
            const orderItem = [];
            let { column } = item;
            const aliasesCol = params?.aliases[item.column];
            if (aliasesCol) {
                column = aliasesCol.column;
                _.forEach(aliasesCol.path.split('.'), (associated) => {
                    orderItem.push(associated);
                });
            }
            orderItem.push(column, item.value);
            if (orderItem.length !== 0) order.push(orderItem);
        });

        const resp = await this.Model.findAndCountAll({
            include,
            order,
            limit: limit,
            offset,
            where,
        });
        const pages = Math.ceil(parseFloat(resp.count) / limit);
        // eslint-disable-next-line consistent-return
        return {
            rows: resp.rows,
            count: resp.count,
            offset,
            page,
            limit,
            pages,
            permissions: {}, // auth.getModelPermissions(type, resp.rows),
        };
    }
}
